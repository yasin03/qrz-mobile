import NetInfo from "@react-native-community/netinfo";
import { useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useCallback, useEffect, useRef } from "react";
import { Alert, AppState } from "react-native";

import { PDKS_QUERY_KEY, pdksGonder } from "@/hooks/use-pdks";
import { ApiClientError } from "@/lib/axios";
import {
  kayitGuncelle,
  kayitSil,
  kuyrugaAboneOl,
  kuyruguOku,
  kuyrukKaydindanKonum,
  type KuyrukKaydi,
} from "@/lib/pdks-kuyruk";
import { useAuthStore } from "@/stores/auth-store";

export type SenkronDurumu = "bos" | "bitti" | "bekliyor" | "mesgul";

export type SenkronSonucu = {
  durum: SenkronDurumu;
  gonderilenler: KuyrukKaydi[];
  /** "Giriş 18.11 08:14: <sunucu mesajı>" biçiminde */
  reddedilenler: string[];
};

type SenkronSecenekleri = {
  /** true: sonuç Alert ile gösterilmez, çağıran kendi mesajına ekler */
  sessiz?: boolean;
};

const bosSonuc = (durum: SenkronDurumu): SenkronSonucu => ({
  durum,
  gonderilenler: [],
  reddedilenler: [],
});

/** Kayıt sunucuya ulaşamadıysa tekrar denenmeli mi? (aksi halde kalıcı red sayılır) */
function tekrarDenenebilir(error: unknown) {
  const status =
    error instanceof ApiClientError
      ? error.status
      : isAxiosError(error)
        ? error.response?.status
        : undefined;

  // Yanıt hiç yok (ağ hatası / timeout) ya da yanıt okunamadı → tekrar dene
  if (status === undefined) return true;
  return status >= 500 || status === 401 || status === 408 || status === 429;
}

function hataMesaji(error: unknown) {
  if (error instanceof ApiClientError) return error.message;
  return error instanceof Error ? error.message : String(error);
}

export const kayitEtiketi = (k: KuyrukKaydi) =>
  `${k.yon} ${new Date(k.timestamp).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })}`;

// Sunucuya ulaşılamadıkça tekrar deneme aralıkları (ms); kalabalık aynı anda yüklenmesin diye sapma eklenir
const BEKLEME_ADIMLARI = [15_000, 30_000, 60_000, 120_000, 300_000];
const SAPMA_MS = 5_000;

// Okutma ekranı ve ana sayfa bandı senkronu buradan tetikler
let aktifSenkron: ((secenek?: SenkronSecenekleri) => Promise<SenkronSonucu>) | null =
  null;

/** Bekleyen kayıtları hemen göndermeyi dener (senkron hook'u mount değilse "bos" döner) */
export function pdksKuyrukGonder(
  secenek?: SenkronSecenekleri,
): Promise<SenkronSonucu> {
  return aktifSenkron ? aktifSenkron(secenek) : Promise.resolve(bosSonuc("bos"));
}

/**
 * Cihazda bekleyen PDKS kayıtlarını sırayla (okutma saatine göre) sunucuya gönderir.
 * Tetikleyiciler: açılış/giriş, uygulama ön plana gelince, bağlantı geri gelince,
 * kuyruğa kayıt eklenince ve ulaşılamadıkça artan aralıklarla.
 * (protected) layout'ta bir kez mount edilir.
 */
export function usePdksKuyrukSenkron() {
  const idKullanici = useAuthStore((s) => s.user?.IDKullanici);
  const queryClient = useQueryClient();
  const calisiyorRef = useRef(false);
  const zamanlayiciRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const beklemeAdimiRef = useRef(0);
  // Senkron sürerken kuyruğa yeni kayıt girdiyse, bitince bir tur daha çalışılır
  const yenidenCalistirRef = useRef(false);

  const zamanlayiciyiTemizle = () => {
    if (zamanlayiciRef.current) clearTimeout(zamanlayiciRef.current);
    zamanlayiciRef.current = null;
  };

  const senkronEt = useCallback(
    async ({ sessiz = false }: SenkronSecenekleri = {}): Promise<SenkronSonucu> => {
    if (!idKullanici) return bosSonuc("bos");
    if (calisiyorRef.current) return bosSonuc("mesgul");
    calisiyorRef.current = true;
    yenidenCalistirRef.current = false;
    zamanlayiciyiTemizle();

    let sonuc: SenkronDurumu = "bos";
    const gonderilenler: KuyrukKaydi[] = [];
    const reddedilenler: string[] = [];

    try {
      const kayitlar = (await kuyruguOku())
        .filter((k) => k.idKullanici === idKullanici)
        .sort((a, b) => a.timestamp - b.timestamp);
      if (kayitlar.length === 0) return bosSonuc("bos");

      sonuc = "bitti";
      for (const kayit of kayitlar) {
        try {
          const { test, sonuc: mesaj } = await pdksGonder({
            idBolum: kayit.idBolum,
            idBolumLokasyon: kayit.idBolumLokasyon,
            yon: kayit.yon,
            position: kuyrukKaydindanKonum(kayit),
            istekId: kayit.id,
            cevrimdisi: true,
          });
          await kayitSil(kayit.id);
          if (test === 1) gonderilenler.push(kayit);
          else reddedilenler.push(`${kayitEtiketi(kayit)}: ${mesaj || "Kabul edilmedi"}`);
        } catch (error) {
          if (tekrarDenenebilir(error)) {
            // Sıra bozulmasın: bu kayıt gitmeden sonrakiler gönderilmez
            await kayitGuncelle(kayit.id, {
              deneme: kayit.deneme + 1,
              sonDeneme: Date.now(),
            });
            sonuc = "bekliyor";
            break;
          }
          await kayitSil(kayit.id);
          reddedilenler.push(`${kayitEtiketi(kayit)}: ${hataMesaji(error)}`);
        }
      }
    } finally {
      calisiyorRef.current = false;
    }

    if (gonderilenler.length || reddedilenler.length) {
      queryClient.invalidateQueries({ queryKey: [PDKS_QUERY_KEY] });
    }

    if (gonderilenler.length && !sessiz) {
      Alert.alert(
        "Bekleyen kayıt gönderildi",
        gonderilenler.map(kayitEtiketi).join("\n"),
      );
    }
    if (reddedilenler.length && !sessiz) {
      // Çoğunlukla ilk istek aslında sunucuya ulaşmış ve kayıt zaten oluşmuştur
      Alert.alert(
        "Bekleyen kayıt kabul edilmedi",
        `${reddedilenler.join("\n")}\n\nKayıt daha önce oluşmuş olabilir; ana sayfadan bugünkü kaydınızı kontrol edin.`,
      );
    }

    if (sonuc === "bekliyor") {
      const adim = Math.min(beklemeAdimiRef.current, BEKLEME_ADIMLARI.length - 1);
      beklemeAdimiRef.current += 1;
      zamanlayiciRef.current = setTimeout(
        () => void senkronEt(),
        BEKLEME_ADIMLARI[adim] + Math.random() * SAPMA_MS,
      );
    } else {
      beklemeAdimiRef.current = 0;
      if (yenidenCalistirRef.current) {
        zamanlayiciRef.current = setTimeout(() => void senkronEt(), 0);
      }
    }

    return { durum: sonuc, gonderilenler, reddedilenler };
    },
    [idKullanici, queryClient],
  );

  useEffect(() => {
    if (!idKullanici) return;

    aktifSenkron = senkronEt;
    void senkronEt();

    const appStateSub = AppState.addEventListener("change", (state) => {
      if (state === "active") void senkronEt();
    });

    let oncekiBagli: boolean | null = null;
    const netInfoUnsub = NetInfo.addEventListener((state) => {
      const bagli = !!state.isConnected && state.isInternetReachable !== false;
      if (bagli && oncekiBagli === false) void senkronEt();
      oncekiBagli = bagli;
    });

    // Kuyruğa yeni kayıt girdiyse ve bekleyen bir deneme yoksa ilk denemeyi planla
    // (sunucu az önce ulaşılamaz olduğu için hemen değil, ilk bekleme adımında)
    const kuyrukUnsub = kuyrugaAboneOl((liste) => {
      const bekleyenVar = liste.some((k) => k.idKullanici === idKullanici);
      if (!bekleyenVar) return;
      if (calisiyorRef.current) {
        yenidenCalistirRef.current = true;
      } else if (!zamanlayiciRef.current) {
        zamanlayiciRef.current = setTimeout(
          () => void senkronEt(),
          BEKLEME_ADIMLARI[0] + Math.random() * SAPMA_MS,
        );
      }
    });

    return () => {
      if (aktifSenkron === senkronEt) aktifSenkron = null;
      appStateSub.remove();
      netInfoUnsub();
      kuyrukUnsub();
      zamanlayiciyiTemizle();
    };
  }, [idKullanici, senkronEt]);
}
