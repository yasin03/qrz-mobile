import { usePermissions } from "@/hooks/use-permissions";
import { useRole } from "@/hooks/use-role";
import { ROLE_GROUPS } from "@/lib/user-types";
import { useRouter, useIsFocused } from "expo-router";
import { BarcodeScanningResult } from "expo-camera";
import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import { View, Alert } from "react-native";
import { isAxiosError } from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { PDKS_QUERY_KEY, usePdksMutation } from "@/hooks/use-pdks";
import { ApiClientError } from "@/lib/axios";
import { PdksYon } from "@/types/pdks";
import { IzinYok } from "@/components/qr-tara/izin-yok";
import { QrScanStatus } from "@/components/qr-tara/qr-scan-status";
import { QrScannerView } from "@/components/qr-tara/qr-scanner-view";
import { YonSecilmedi } from "@/components/qr-tara/yon-secilmedi";
import { YonSecimDialog } from "@/components/qr-tara/yon-secim-dialog";
import { useStatusBarStyle } from "@/hooks/use-status-bar-style";
import { KonumKapali } from "@/components/qr-tara/konum-kapali";
import { getKonum, parseQrPayload } from "@/components/qr-tara/utils";
import { useKonumServisi } from "@/hooks/use-konum-servisi";
import {
  kayitEtiketi,
  pdksKuyrukGonder,
  type SenkronSonucu,
} from "@/hooks/use-pdks-kuyruk-senkron";
import {
  konumdanKuyrukKaydi,
  kuyrugaEkle,
  kuyruguOku,
  type KuyrukKaydi,
} from "@/lib/pdks-kuyruk";
import { useAuthStore } from "@/stores/auth-store";
import * as Crypto from "expo-crypto";

// Hata mesajına eklenen kısa teknik detay (sahada hangi hatanın oluştuğunu görebilmek için)
function hataDetayi(error: unknown) {
  if (isAxiosError(error)) {
    return [error.code, error.response?.status, error.message]
      .filter(Boolean)
      .join(" · ");
  }
  return error instanceof Error ? error.message : String(error);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Sunucuya hiç ulaşılamadı (yanıt yok, timeout değil) → kısa aralıkla tekrar denenebilir */
function baglantiKurulamadi(error: unknown) {
  return (
    isAxiosError(error) && !error.response && error.code !== "ECONNABORTED"
  );
}

/** Ekranda gönderilmeden önce kuyruktaki eski kayıtların gönderim sonucu (mesaja eklenir) */
function oncekiKayitNotu(onceki: SenkronSonucu | null) {
  if (!onceki) return "";
  let not = "";
  if (onceki.gonderilenler.length) {
    not += `\n\nBekleyen kaydınız da gönderildi:\n${onceki.gonderilenler
      .map(kayitEtiketi)
      .join("\n")}`;
  }
  if (onceki.reddedilenler.length) {
    not += `\n\nBekleyen kayıt kabul edilmedi (daha önce oluşmuş olabilir):\n${onceki.reddedilenler.join("\n")}`;
  }
  return not;
}

/** ERR_NETWORK'te toplam deneme sayısı; aralar 1-3 sn rastgele (kalabalık aynı anda tekrarlamasın) */
const TEKRAR_SAYISI = 3;

const QRTara = () => {
  // Siyah kamera ekranı üstünde beyaz durum çubuğu ikonları
  useStatusBarStyle("light-content");
  const router = useRouter();
  const { hasRole } = useRole();
  const { ensurePermissions, permissionsGranted } = usePermissions();
  const pdksMutation = usePdksMutation();
  const queryClient = useQueryClient();
  const idKullanici = useAuthStore((s) => s.user?.IDKullanici);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  // İşlem/başarı ekranındaki metinler (kuyruk ve tekrar deneme durumları için)
  const [durumMetni, setDurumMetni] = useState<string | undefined>();
  const [basariMetni, setBasariMetni] = useState<string | undefined>();
  const [yon, setYon] = useState<PdksYon | null>(null);
  const [yonDialogVisible, setYonDialogVisible] = useState(false);
  const scanLockRef = useRef(false);
  const isFocused = useIsFocused();
  const isFocusedRef = useRef(isFocused);

  // Konum servisi kapalıysa QR okutulamaz (iOS/Android aynı): kamera yerine "Konum kapalı" ekranı
  const { konumAcik, kontrolEt: konumKontrolEt } = useKonumServisi(
    isFocused && permissionsGranted,
  );

  // Ekran açıkken konumu önceden "ısıt": kullanıcı yön seçip QR'ı hizalarken
  // GPS/ağ konumu hazırlanır, okutunca çoğu zaman beklemeden taze konum vardır.
  const lastFixRef = useRef<Location.LocationObject | null>(null);
  useEffect(() => {
    if (!isFocused || !permissionsGranted || !konumAcik) return;

    let subscription: Location.LocationSubscription | null = null;
    let iptal = false;

    Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, timeInterval: 2000 },
      (position) => {
        lastFixRef.current = position;
      },
    )
      .then((sub) => {
        if (iptal) sub.remove();
        else subscription = sub;
      })
      .catch(() => {
        // Isıtma başlamazsa tarama anında konum yine istenir (getKonum)
      });

    return () => {
      iptal = true;
      subscription?.remove();
    };
  }, [isFocused, permissionsGranted, konumAcik]);

  useEffect(() => {
    isFocusedRef.current = isFocused;

    // Sayfaya her gelişte tarama durumu ve yön seçimi sıfırlanır, dialog açılır
    if (isFocused) {
      setScanSuccess(false);
      scanLockRef.current = false;
      setYon(null);
      setYonDialogVisible(true);
    } else {
      setYonDialogVisible(false);
    }
  }, [isFocused]);

  function alertIfFocused(...args: Parameters<typeof Alert.alert>) {
    if (isFocusedRef.current) {
      Alert.alert(...args);
    }
  }

  useEffect(() => {
    ensurePermissions();
  }, []);

  const handleYonSelect = (selected: PdksYon) => {
    setYon(selected);
    setYonDialogVisible(false);
  };

  const handleLocationPress = () => {
    setYonDialogVisible(false);
    router.push("/lokasyon");
  };

  const handleBarcodeScanned = async (result: BarcodeScanningResult) => {
    if (!yon || scanLockRef.current || isProcessing) return;
    scanLockRef.current = true;
    setIsProcessing(true); // kamera burada kapanacak (aşağıdaki render'a bak)
    setDurumMetni(undefined);
    setBasariMetni(undefined);

    // Sunucuya ulaşılamazsa telefonda saklanacak kayıt (konum alındıktan sonra oluşur)
    let kuyrukKaydi: KuyrukKaydi | null = null;

    const kuyrugaAl = async (kayit: KuyrukKaydi, not = "") => {
      await kuyrugaEkle(kayit);
      setBasariMetni("Kayıt telefonda saklandı");
      setScanSuccess(true);
      alertIfFocused(
        "Kaydınız alındı",
        `Sunucuya şu an ulaşılamadı. ${kayitEtiketi(kayit)} kaydınız okutma saatiyle ` +
          "telefonunuzda saklandı ve bağlantı sağlanınca otomatik gönderilecek.\n\n" +
          "Tekrar okutmanıza gerek yok; bekleyen kaydı ana sayfada görebilirsiniz." +
          not,
        [
          {
            text: "Tamam",
            onPress: () => {
              setScanSuccess(false);
              scanLockRef.current = false;
              router.replace("/(protected)/(tabs)");
            },
          },
        ],
        { cancelable: false },
      );
    };

    try {
      const { idBolumLokasyon, idBolum, enlem, boylam } = parseQrPayload(
        result.data,
      );

      if (
        !idBolumLokasyon ||
        !idBolum ||
        Number.isNaN(enlem) ||
        Number.isNaN(boylam)
      ) {
        alertIfFocused("Hata", "QR kod okunamadı veya format geçersiz.");
        scanLockRef.current = false;
        return;
      }

      // Okuturken konum kapatılmış olabilir → kayıt gönderilmez, "Konum kapalı" ekranı gelir
      if (!(await konumKontrolEt())) {
        scanLockRef.current = false;
        return;
      }

      // Konum açık ama bulunamazsa 0,0 döner (DB'de "konum alınamayan kayıt"), hata fırlatmaz
      const { position, kaynak } = await getKonum({
        hazirKonum: lastFixRef.current,
      });

      if (kaynak !== "yok" && position.mocked) {
        alertIfFocused(
          "Hata",
          "Sahte konum tespit edildi. Kayıt oluşturulamaz.",
        );
        scanLockRef.current = false;
        return;
      }
      if (idKullanici) {
        kuyrukKaydi = konumdanKuyrukKaydi(
          {
            id: Crypto.randomUUID(),
            idKullanici,
            idBolum,
            idBolumLokasyon,
            yon,
          },
          position,
        );
      }

      // Önceki okutmalardan bekleyen kayıt varsa önce onlar gitmeli (giriş, çıkıştan önce).
      // Hâlâ gönderilemiyorsa bu kayıt da sırayı bozmamak için doğrudan kuyruğa girer.
      let onceki: SenkronSonucu | null = null;
      if (
        kuyrukKaydi &&
        (await kuyruguOku()).some((k) => k.idKullanici === idKullanici)
      ) {
        setDurumMetni("Bekleyen kayıtlar gönderiliyor...");
        onceki = await pdksKuyrukGonder({ sessiz: true });
        if (onceki.durum === "bekliyor" || onceki.durum === "mesgul") {
          await kuyrugaAl(kuyrukKaydi, oncekiKayitNotu(onceki));
          return;
        }
      }

      const payload = {
        idBolum,
        idBolumLokasyon,
        position,
        yon,
        istekId: kuyrukKaydi?.id,
      };

      // Bağlantı kurulamazsa (ERR_NETWORK) kısa, rastgele aralıklarla birkaç kez daha dene
      setDurumMetni("Kayıt gönderiliyor...");
      let yanit: Awaited<ReturnType<typeof pdksMutation.mutateAsync>>;
      for (let deneme = 1; ; deneme++) {
        try {
          yanit = await pdksMutation.mutateAsync(payload);
          break;
        } catch (error) {
          if (deneme < TEKRAR_SAYISI && baglantiKurulamadi(error)) {
            setDurumMetni(
              `Bağlantı kurulamadı, tekrar deneniyor (${deneme + 1}/${TEKRAR_SAYISI})...`,
            );
            await sleep(1000 + Math.random() * 2000);
            continue;
          }
          throw error;
        }
      }
      const { test, sonuc } = yanit;
      const not = oncekiKayitNotu(onceki);

      if (test !== 1) {
        // Kayıt reddedildi (ör. bugün zaten giriş/çıkış var) - kamera açılmadan yön seçimine dön
        setYon(null);
        alertIfFocused(
          "Uyarı",
          (sonuc || "İşlem gerçekleştirilemedi.") + not,
          [
            {
              text: "Tamam",
              onPress: () => {
                scanLockRef.current = false;
                setYonDialogVisible(true);
              },
            },
          ],
          { cancelable: false },
        );
        return;
      }

      setScanSuccess(true);

      const { latitude, longitude, accuracy } = position.coords;

      alertIfFocused(
        "PDKS Kaydı Oluşturuldu",
        `${sonuc}\n\n` +
          (kaynak === "yok"
            ? "⚠️ Konum alınamadı, kayıt konumsuz oluşturuldu.\n\n"
            : kaynak === "son-bilinen"
              ? "(Son bilinen konum kullanıldı)\n\n"
              : "") +
          `Yön: ${yon}\n\n` +
          `QR Verisi:\n` +
          `Bölüm Lokasyon: ${idBolumLokasyon}\n` +
          `Bölüm: ${idBolum}\n` +
          `Enlem: ${enlem}\n` +
          `Boylam: ${boylam}\n\n` +
          `Telefon Konum Verisi:\n` +
          `Enlem: ${latitude}\n` +
          `Boylam: ${longitude}\n` +
          `Doğruluk: ${accuracy != null ? `${accuracy.toFixed(1)} m` : "-"}\n` +
          `Zaman: ${new Date(position.timestamp).toLocaleString("tr-TR")}` +
          not,
        [
          {
            text: "Tamam",
            onPress: () => {
              setScanSuccess(false);
              scanLockRef.current = false;
              router.replace("/(protected)/(tabs)");
            },
          },
        ],
        // Başarı ekranı (kamera kapalı) Tamam'a basılana kadar kalır
        { cancelable: false },
      );
    } catch (error) {
      if (error instanceof ApiClientError) {
        alertIfFocused("Hata", error.message);
        scanLockRef.current = false;
        return;
      }

      console.error("QR tarama hatası:", error);

      // Sunucudan hiç yanıt gelmedi (ağ hatası / timeout) → kayıt telefonda saklanır,
      // bağlantı gelince okutma saatiyle gönderilir. İlk istek aslında yazılmışsa
      // sunucu tekrarını "zaten var" diye reddeder; çift kayıt oluşmaz.
      if (kuyrukKaydi && isAxiosError(error) && !error.response) {
        try {
          await kuyrugaAl(kuyrukKaydi);
          return;
        } catch (kuyrukHatasi) {
          console.error("PDKS kuyruğa yazılamadı:", kuyrukHatasi);
        }
      }

      // İstek sunucuya gitti ama yanıt gelmedi/okunamadı → kayıt DB'ye yazılmış olabilir.
      // Tekrar okutup çift kayıt oluşmasın diye listeyi tazeleyip ana sayfaya yönlendir.
      const yanitBelirsiz =
        (isAxiosError(error) && !error.response) ||
        (error instanceof Error && error.message === "PDKS_INVALID_RESPONSE");

      if (yanitBelirsiz) {
        queryClient.invalidateQueries({ queryKey: [PDKS_QUERY_KEY] });
        alertIfFocused(
          "Yanıt Alınamadı",
          "Kaydınız sunucuya gönderildi ancak yanıt alınamadı. Kayıt oluşmuş olabilir; " +
            "tekrar okutmadan önce ana sayfadan bugünkü kaydınızı kontrol edin.\n\n" +
            `(${hataDetayi(error)})`,
          [
            {
              text: "Tamam",
              onPress: () => {
                scanLockRef.current = false;
                router.replace("/(protected)/(tabs)");
              },
            },
          ],
          { cancelable: false },
        );
        return;
      }

      alertIfFocused(
        "Hata",
        `QR işlenemedi. Lütfen tekrar deneyin.\n\n(${hataDetayi(error)})`,
      );
      scanLockRef.current = false;
    } finally {
      setIsProcessing(false);
      setDurumMetni(undefined);
    }
  };

  return (
    <View className="flex-1 bg-black">
      {permissionsGranted ? (
        <View className="flex-1">
          {isProcessing || scanSuccess ? (
            <QrScanStatus
              success={scanSuccess}
              yukleniyorMetni={durumMetni}
              basariMetni={basariMetni}
            />
          ) : konumAcik === false ? (
            <KonumKapali />
          ) : !yon ? (
            <YonSecilmedi onPress={() => setYonDialogVisible(true)} />
          ) : (
            <QrScannerView
              yon={yon}
              onBarcodeScanned={handleBarcodeScanned}
              onYonPress={() => setYonDialogVisible(true)}
            />
          )}
        </View>
      ) : (
        <IzinYok />
      )}

      <YonSecimDialog
        visible={yonDialogVisible}
        onSelect={handleYonSelect}
        onClose={() => setYonDialogVisible(false)}
        showLocationButton={hasRole(ROLE_GROUPS.ADMIN_VE_YONETICI)}
        onLocationPress={handleLocationPress}
      />
    </View>
  );
};

export default QRTara;
