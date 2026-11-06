import * as Location from "expo-location";

export function parseQrPayload(qrText: string) {
  const [idBolumLokasyon, idBolum, enlem, boylam] = qrText.split("|");
  return {
    idBolumLokasyon: Number(idBolumLokasyon),
    idBolum: Number(idBolum),
    enlem: Number(enlem),
    boylam: Number(boylam),
  };
}

export type KonumKaynagi = "anlik" | "son-bilinen" | "yok";

export type KonumSonucu = {
  position: Location.LocationObject;
  kaynak: KonumKaynagi;
};

/** Isıtılmış (watch) konum bu süreden tazeyse beklemeden kullanılır */
const HAZIR_KONUM_MAX_YAS = 30_000;
/** Anlık konum bulunamazsa kabul edilecek en eski "son bilinen" konum */
const SON_BILINEN_MAX_YAS = 5 * 60_000;

/** Promise'i süre sınırıyla bekler; zaman aşımında veya hatada null döner (hiç fırlatmaz). */
function enFazla<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      () => {
        clearTimeout(timer);
        resolve(null);
      },
    );
  });
}

/** Konum hiç alınamadığında gönderilen kayıt: 0,0 → DB'de "konum alınamayan kayıt" */
function sifirKonum(): Location.LocationObject {
  return {
    coords: {
      latitude: 0,
      longitude: 0,
      altitude: null,
      accuracy: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
    },
    timestamp: Date.now(),
    mocked: false,
  };
}

/**
 * Konum servisinin AÇIK olduğu varsayımıyla konum alır; hiçbir durumda hata fırlatmaz.
 * Sıra: taze ısıtılmış konum → anlık konum (timeout'lu) → son bilinen konum → 0,0
 */
export async function getKonum({
  hazirKonum,
  timeoutMs = 10_000,
}: {
  hazirKonum?: Location.LocationObject | null;
  timeoutMs?: number;
} = {}): Promise<KonumSonucu> {
  if (hazirKonum && Date.now() - hazirKonum.timestamp <= HAZIR_KONUM_MAX_YAS) {
    return { position: hazirKonum, kaynak: "anlik" };
  }

  // High: Android'de GPS + Wi-Fi/baz istasyonu birleşik (fused) → bina içinde de sonuç verir.
  // Highest sadece GPS'e dayanıp kapalı alanda zaman aşımına düşüyordu.
  const anlik = await enFazla(
    Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }),
    timeoutMs,
  );
  if (anlik) return { position: anlik, kaynak: "anlik" };

  const sonBilinen = await enFazla(
    Location.getLastKnownPositionAsync({ maxAge: SON_BILINEN_MAX_YAS }),
    2_000,
  );
  if (sonBilinen) return { position: sonBilinen, kaynak: "son-bilinen" };

  return { position: sifirKonum(), kaynak: "yok" };
}
