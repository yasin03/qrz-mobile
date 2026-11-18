// GEÇİCİ test ekranı: admin-web'deki sistem/qr simülasyon sayfasının mobil karşılığı.
// QR okutunca çalışan INSERT_PDKS_KENDI isteğini, cevap beklemeden belirli aralıkla
// art arda gönderir; mobil ağ yolunda (hücresel / Wi-Fi) yük altında hata olup
// olmadığını ölçmek için. Test bitince bu dosya, _layout'taki HIDDEN_SCREENS kaydı,
// YonSecimDialog'daki buton ve qrz-admin pdks/route.js'teki mobil izni silinecek.
import { FormInput } from "@/components/form/form-input";
import { DetailScreenHeader } from "@/components/detail-screen-header";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useRole } from "@/hooks/use-role";
import { api, ApiClientError } from "@/lib/axios";
import { useNetInfo } from "@react-native-community/netinfo";
import { isAxiosError } from "axios";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Share, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

type FormValues = {
  IDSubePersonel: string;
  idBolum: string;
  idBolumLokasyon: string;
  idDevice: string;
  latitude: string;
  longitude: string;
  baslangic: string;
  accuracy: string;
  altitude: string;
  altitudeAccuracy: string;
  adet: string;
  zamanAdimiDk: string;
  aralikMs: string;
};

type Sonuc = {
  sira: number;
  yon: "Giriş" | "Çıkış";
  zaman: number;
  /** Testin başından itibaren isteğin çıktığı an (ms) */
  baslangicMs: number;
  sureMs: number;
  test: number | null;
  /** ok | ERR_NETWORK | ECONNABORTED | HTTP 500 ... */
  hataTuru: string | null;
  mesaj: string;
};

function bugun0830() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T08:30:00.000Z`;
}

// admin-web sayfasıyla aynı varsayılanlar (başlangıç: bugün 08:30)
const DEFAULTS: FormValues = {
  IDSubePersonel: "40",
  idBolum: "4",
  idBolumLokasyon: "4",
  idDevice: "705ec7d5-db1f-4d27-9efd-0e0c9b48deb9",
  latitude: "37.206455287372",
  longitude: "38.81643987887085",
  baslangic: bugun0830(),
  accuracy: "9.00887410962962",
  altitude: "711.0139501177425",
  altitudeAccuracy: "30",
  adet: "100",
  zamanAdimiDk: "5",
  aralikMs: "100",
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Prosedür sonucu {..}, [{..}] ya da [[{..}]] dönebilir
function sonucuBul(data: unknown): { test: unknown; sonuc?: unknown } | null {
  if (Array.isArray(data)) {
    for (const item of data) {
      const found = sonucuBul(item);
      if (found) return found;
    }
    return null;
  }
  if (data && typeof data === "object" && "test" in data) {
    return data as { test: unknown; sonuc?: unknown };
  }
  return null;
}

function hatayiSiniflandir(err: unknown): { hataTuru: string; mesaj: string } {
  if (err instanceof ApiClientError) {
    return {
      hataTuru: `HTTP ${err.status}${err.code ? ` ${err.code}` : ""}`,
      mesaj: err.message,
    };
  }
  if (isAxiosError(err)) {
    return {
      hataTuru: err.response
        ? `HTTP ${err.response.status}`
        : (err.code ?? "AĞ HATASI"),
      mesaj: err.message,
    };
  }
  return {
    hataTuru: "DİĞER",
    mesaj: err instanceof Error ? err.message : String(err),
  };
}

function yuzdelik(degerler: number[], p: number) {
  if (degerler.length === 0) return 0;
  const sirali = [...degerler].sort((a, b) => a - b);
  return sirali[Math.min(sirali.length - 1, Math.ceil((p / 100) * sirali.length) - 1)];
}

const saatFormat = (ms: number) =>
  new Date(ms).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });

const YukTesti = () => {
  const { isAdmin } = useRole();
  const net = useNetInfo();
  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues: DEFAULTS,
  });
  const [calisiyor, setCalisiyor] = useState(false);
  const [sonuclar, setSonuclar] = useState<Sonuc[]>([]);
  const [toplamMs, setToplamMs] = useState<number | null>(null);
  const durdurRef = useRef(false);

  const agBilgisi =
    `${net.type}` +
    (net.type === "cellular" && net.details && "cellularGeneration" in net.details
      ? ` (${net.details.cellularGeneration ?? "?"}${
          net.details.carrier ? `, ${net.details.carrier}` : ""
        })`
      : "") +
    ` · bağlı: ${String(net.isConnected)} · internet: ${String(net.isInternetReachable)}`;

  const gonder = async (v: FormValues) => {
    const adet = Math.max(1, Number(v.adet) || 1);
    const aralikMs = Math.max(0, Number(v.aralikMs) || 0);
    const adimMs = (Number(v.zamanAdimiDk) || 0) * 60_000;
    // "Z" yok sayılır: "2026-11-30T08:30:00.000Z" → yerel 30 Kasım 08:30 → timestamp (ms)
    const baslangic = new Date(v.baslangic.trim().replace(/Z$/i, "")).getTime();
    if (!Number.isFinite(baslangic)) return;

    durdurRef.current = false;
    setCalisiyor(true);
    setSonuclar([]);
    setToplamMs(null);

    const testBasi = Date.now();
    const istekler: Promise<void>[] = [];

    for (let i = 0; i < adet && !durdurRef.current; i++) {
      // Giriş, Çıkış, Giriş... ; her kayıt bir öncekinden zamanAdimiDk sonra
      const yon = i % 2 === 0 ? "Giriş" : "Çıkış";
      const zaman = baslangic + i * adimMs;
      const JsonData = JSON.stringify({
        idBolum: Number(v.idBolum),
        idBolumLokasyon: Number(v.idBolumLokasyon),
        idDevice: v.idDevice,
        latitude: Number(v.latitude),
        longitude: Number(v.longitude),
        timestamp: zaman,
        accuracy: Number(v.accuracy),
        altitude: Number(v.altitude),
        altitudeAccuracy: Number(v.altitudeAccuracy),
      });

      const sira = i + 1;
      const t0 = Date.now();

      // Cevap beklenmeden bir sonraki istek aralikMs sonra gider
      istekler.push(
        api
          .post("/api/pdks", {
            type: "INSERT_PDKS_KENDI",
            IDSubePersonel: v.IDSubePersonel,
            Yon: yon,
            JsonData,
          })
          .then(({ data }) => {
            const r = sonucuBul(data);
            return r
              ? { test: Number(r.test), hataTuru: null, mesaj: String(r.sonuc ?? "") }
              : {
                  test: null,
                  hataTuru: "GEÇERSİZ YANIT",
                  mesaj: JSON.stringify(data)?.slice(0, 200) ?? "",
                };
          })
          .catch((err) => ({ test: null, ...hatayiSiniflandir(err) }))
          .then(({ test, hataTuru, mesaj }) => {
            const sonuc: Sonuc = {
              sira,
              yon,
              zaman,
              baslangicMs: t0 - testBasi,
              sureMs: Date.now() - t0,
              test,
              hataTuru,
              mesaj,
            };
            setSonuclar((prev) =>
              [...prev, sonuc].sort((a, b) => a.sira - b.sira),
            );
          }),
      );

      if (i < adet - 1) await sleep(aralikMs);
    }

    await Promise.all(istekler);
    setToplamMs(Date.now() - testBasi);
    setCalisiyor(false);
  };

  // Özet
  const basarili = sonuclar.filter((s) => s.test === 1).length;
  const reddedilen = sonuclar.filter((s) => s.test !== null && s.test !== 1).length;
  const hatalar = sonuclar.filter((s) => s.hataTuru);
  const hataDagilimi = hatalar.reduce<Record<string, number>>((acc, s) => {
    acc[s.hataTuru!] = (acc[s.hataTuru!] ?? 0) + 1;
    return acc;
  }, {});
  const sureler = sonuclar.map((s) => s.sureMs);
  const ortalama = sureler.length
    ? Math.round(sureler.reduce((a, b) => a + b, 0) / sureler.length)
    : 0;
  const ilkHata = hatalar.reduce<Sonuc | null>(
    (ilk, s) => (!ilk || s.baslangicMs < ilk.baslangicMs ? s : ilk),
    null,
  );

  const ozetMetni = [
    `Ağ: ${agBilgisi}`,
    `Gönderilen: ${sonuclar.length}${toplamMs != null ? ` · Toplam süre: ${toplamMs} ms` : ""}`,
    `Kaydedildi (test=1): ${basarili} · Reddedildi (test≠1): ${reddedilen} · Hata: ${hatalar.length}`,
    ...Object.entries(hataDagilimi).map(([tur, n]) => `  - ${tur}: ${n}`),
    `Süre ort/p95/maks: ${ortalama} / ${yuzdelik(sureler, 95)} / ${sureler.length ? Math.max(...sureler) : 0} ms`,
    ilkHata
      ? `İlk hata: #${ilkHata.sira}, testin ${ilkHata.baslangicMs}. ms'sinde (${ilkHata.hataTuru})`
      : "İlk hata: yok",
  ].join("\n");

  const paylas = () => {
    const satirlar = sonuclar.map(
      (s) =>
        `#${s.sira}\t${s.yon}\t${saatFormat(s.zaman)}\t+${s.baslangicMs}ms\t${s.sureMs}ms\t` +
        `${s.test ?? "-"}\t${s.hataTuru ?? "ok"}\t${s.mesaj}`,
    );
    Share.share({
      message: `QRZ mobil yük testi — ${new Date().toLocaleString("tr-TR")}\n\n${ozetMetni}\n\n${satirlar.join("\n")}`,
    });
  };

  if (!isAdmin) {
    return (
      <View className="flex-1 bg-white">
        <DetailScreenHeader title="Yük Testi" />
        <Text className="p-6 text-slate-600">Bu ekran yalnızca admin içindir.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <DetailScreenHeader title="Yük Testi (geçici)" />
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ gap: 12, padding: 16, paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled"
        bottomOffset={24}
      >
        <Text className="text-sm text-slate-600">
          INSERT_PDKS_KENDI isteğini Giriş/Çıkış sırasıyla, cevap beklemeden
          art arda gönderir. Kayıtlar seçilen personel adına DB&apos;ye yazılır.
        </Text>
        <Text className="rounded-md bg-slate-100 p-2 text-xs text-slate-700">
          Ağ: {agBilgisi}
        </Text>

        <FormInput control={control} name="IDSubePersonel" label="IDSubePersonel" type="number" required />
        <FormInput control={control} name="idBolum" label="idBolum" type="number" />
        <FormInput control={control} name="idBolumLokasyon" label="idBolumLokasyon" type="number" />
        <FormInput control={control} name="idDevice" label="idDevice" />
        <FormInput control={control} name="latitude" label="Enlem (latitude)" />
        <FormInput control={control} name="longitude" label="Boylam (longitude)" />
        <FormInput control={control} name="baslangic" label="Başlangıç (yerel saat; sondaki Z yok sayılır)" />
        <FormInput control={control} name="accuracy" label="accuracy" />
        <FormInput control={control} name="altitude" label="altitude" />
        <FormInput control={control} name="altitudeAccuracy" label="altitudeAccuracy" />
        <FormInput control={control} name="adet" label="Adet" type="number" />
        <FormInput control={control} name="zamanAdimiDk" label="Zaman adımı (dk)" type="number" />
        <FormInput control={control} name="aralikMs" label="İstek aralığı (ms)" type="number" />

        <View className="flex-row gap-3">
          <Button className="flex-1" onPress={handleSubmit(gonder)} disabled={calisiyor}>
            <Text>{calisiyor ? `Gönderiliyor… (${sonuclar.length})` : "Başlat"}</Text>
          </Button>
          <Button
            className="flex-1"
            variant="outline"
            onPress={() => (durdurRef.current = true)}
            disabled={!calisiyor}
          >
            <Text>Durdur</Text>
          </Button>
        </View>

        {sonuclar.length > 0 && (
          <>
            <View className="gap-1 rounded-md border border-slate-200 p-3">
              <Text className="text-xs text-slate-800">{ozetMetni}</Text>
            </View>
            <Button variant="outline" onPress={paylas} disabled={calisiyor}>
              <Text>Sonucu paylaş</Text>
            </Button>

            {sonuclar.map((s) => (
              <View
                key={s.sira}
                className={
                  "rounded-md border px-3 py-2 " +
                  (s.test === 1
                    ? "border-green-200 bg-green-50"
                    : s.hataTuru
                      ? "border-red-200 bg-red-50"
                      : "border-amber-200 bg-amber-50")
                }
              >
                <Text className="text-xs font-semibold text-slate-800">
                  #{s.sira} · {s.yon} {saatFormat(s.zaman)} · +{s.baslangicMs} ms ·{" "}
                  {s.sureMs} ms · {s.hataTuru ?? `test=${s.test}`}
                </Text>
                {!!s.mesaj && (
                  <Text className="text-xs text-slate-600" numberOfLines={2}>
                    {s.mesaj}
                  </Text>
                )}
              </View>
            ))}
          </>
        )}
      </KeyboardAwareScrollView>
    </View>
  );
};

export default YukTesti;
