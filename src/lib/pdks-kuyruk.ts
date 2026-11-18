import AsyncStorage from "@react-native-async-storage/async-storage";
import type * as Location from "expo-location";
import { useEffect, useState } from "react";

import type { PdksYon } from "@/types/pdks";

/**
 * Sunucuya ulaşılamadığı için gönderilemeyen PDKS kayıtları (QR okutma) burada,
 * cihazda saklanır ve bağlantı gelince use-pdks-kuyruk-senkron ile gönderilir.
 * Kayıt saati okutma anındaki timestamp'tir; geç gönderilse de o saatle yazılır.
 */
export type KuyrukKaydi = {
  /** Aynı zamanda JsonData.istekId olarak gönderilir */
  id: string;
  /** Kaydı oluşturan kullanıcı; yalnızca o kullanıcı giriş yapmışken gönderilir */
  idKullanici: string;
  idBolum: number;
  idBolumLokasyon: number;
  yon: PdksYon;
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number | null;
    altitude: number | null;
    altitudeAccuracy: number | null;
  };
  /** Okutma anı (ms) */
  timestamp: number;
  deneme: number;
  sonDeneme: number | null;
};

const KUYRUK_KEY = "qrz_pdks_kuyruk";

type Dinleyici = (kayitlar: KuyrukKaydi[]) => void;
const dinleyiciler = new Set<Dinleyici>();

// Okuma-değiştirme-yazma işlemleri sırayla çalışsın; eşzamanlı yazmalar birbirini ezmesin
let zincir: Promise<unknown> = Promise.resolve();
function sirala<T>(is: () => Promise<T>): Promise<T> {
  const sonuc = zincir.then(is, is);
  zincir = sonuc.catch(() => undefined);
  return sonuc;
}

async function oku(): Promise<KuyrukKaydi[]> {
  try {
    const ham = await AsyncStorage.getItem(KUYRUK_KEY);
    const liste = ham ? JSON.parse(ham) : [];
    return Array.isArray(liste) ? liste : [];
  } catch {
    return [];
  }
}

async function yaz(kayitlar: KuyrukKaydi[]) {
  await AsyncStorage.setItem(KUYRUK_KEY, JSON.stringify(kayitlar));
  dinleyiciler.forEach((d) => d(kayitlar));
}

export function kuyrugaEkle(kayit: KuyrukKaydi) {
  return sirala(async () => {
    const liste = await oku();
    liste.push(kayit);
    await yaz(liste);
  });
}

export function kuyruguOku() {
  return sirala(oku);
}

export function kayitSil(id: string) {
  return sirala(async () => {
    const liste = await oku();
    await yaz(liste.filter((k) => k.id !== id));
  });
}

export function kayitGuncelle(id: string, degisiklik: Partial<KuyrukKaydi>) {
  return sirala(async () => {
    const liste = await oku();
    await yaz(liste.map((k) => (k.id === id ? { ...k, ...degisiklik } : k)));
  });
}

/** Kuyruk her değiştiğinde çağrılır; aboneliği kaldıran fonksiyonu döner */
export function kuyrugaAboneOl(dinleyici: Dinleyici) {
  dinleyiciler.add(dinleyici);
  return () => {
    dinleyiciler.delete(dinleyici);
  };
}

export function konumdanKuyrukKaydi(
  params: Omit<KuyrukKaydi, "coords" | "timestamp" | "deneme" | "sonDeneme">,
  position: Location.LocationObject,
): KuyrukKaydi {
  const { latitude, longitude, accuracy, altitude, altitudeAccuracy } =
    position.coords;
  return {
    ...params,
    coords: { latitude, longitude, accuracy, altitude, altitudeAccuracy },
    timestamp: position.timestamp,
    deneme: 0,
    sonDeneme: null,
  };
}

export function kuyrukKaydindanKonum(
  kayit: KuyrukKaydi,
): Location.LocationObject {
  return {
    coords: { ...kayit.coords, heading: null, speed: null },
    timestamp: kayit.timestamp,
    mocked: false,
  };
}

/** Kullanıcının gönderilmeyi bekleyen kayıtları (okutma saatine göre sıralı) */
export function useBekleyenKayitlar(idKullanici: string | undefined) {
  const [kayitlar, setKayitlar] = useState<KuyrukKaydi[]>([]);

  useEffect(() => {
    if (!idKullanici) {
      setKayitlar([]);
      return;
    }
    const filtrele = (liste: KuyrukKaydi[]) =>
      setKayitlar(
        liste
          .filter((k) => k.idKullanici === idKullanici)
          .sort((a, b) => a.timestamp - b.timestamp),
      );

    let iptal = false;
    kuyruguOku().then((liste) => {
      if (!iptal) filtrele(liste);
    });
    const aboneligiBirak = kuyrugaAboneOl(filtrele);
    return () => {
      iptal = true;
      aboneligiBirak();
    };
  }, [idKullanici]);

  return kayitlar;
}
