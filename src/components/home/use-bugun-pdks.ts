import { useEffect, useMemo, useState } from "react";

import { usePdksDetay, usePdksSelect } from "@/hooks/use-pdks";
import {
  bugunKey,
  parseYerelTarih,
  toGunKey,
} from "@/components/pdks/pdks-helpers";

export type BugunDurum = "gelmedi" | "iceride" | "cikti";

type Hareket = { yon: "Giriş" | "Çıkış"; zaman: Date };

/**
 * Personelin bugünkü PDKS durumu.
 * - Durum günün SON hareketine göre belirlenir (öğle arası gibi ara çıkışlar
 *   doğru yansısın diye). Detay gelmediyse ilk giriş / son çıkışa düşülür.
 * - Çalışma süresi giriş→çıkış çiftlerinin toplamıdır (net); içerideyken
 *   son girişten bu yana geçen süre eklenir ve her saniye güncellenir.
 */
export function useBugunPdks() {
  const bugun = bugunKey();
  const { data: pdksData = [] } = usePdksSelect({
    Yil: bugun.slice(0, 4),
    Ay: bugun.slice(5, 7),
  });
  const pdks = pdksData.find((k) => toGunKey(k.Tarih) === bugun);

  const { data: detay } = usePdksDetay(pdks?.IDSubePersonelSaat ?? null);

  const hareketler = useMemo<Hareket[]>(() => {
    const fromDetay = (detay ?? [])
      .map((h) => ({
        yon: h.Yon === "Giriş" ? ("Giriş" as const) : ("Çıkış" as const),
        zaman: parseYerelTarih(h.Tarih),
      }))
      .filter((h): h is Hareket => h.zaman !== null)
      .sort((a, b) => a.zaman.getTime() - b.zaman.getTime());

    if (fromDetay.length) return fromDetay;

    // Detay yoksa: ilk giriş / son çıkış
    const fallback: Hareket[] = [];
    const giris = parseYerelTarih(pdks?.Giris);
    const cikis = parseYerelTarih(pdks?.Cikis);
    if (giris) fallback.push({ yon: "Giriş", zaman: giris });
    if (cikis) fallback.push({ yon: "Çıkış", zaman: cikis });
    return fallback;
  }, [detay, pdks?.Giris, pdks?.Cikis]);

  const sonHareket = hareketler[hareketler.length - 1];
  const durum: BugunDurum = !sonHareket
    ? "gelmedi"
    : sonHareket.yon === "Giriş"
      ? "iceride"
      : "cikti";

  // İçerideyken sayaç her saniye ilerlesin
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (durum !== "iceride") return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [durum]);

  const calismaMs = useMemo(() => {
    let toplam = 0;
    let acikGiris: Date | null = null;

    for (const h of hareketler) {
      if (h.yon === "Giriş") {
        acikGiris ??= h.zaman; // art arda girişlerde ilki geçerli
      } else if (acikGiris) {
        toplam += h.zaman.getTime() - acikGiris.getTime();
        acikGiris = null;
      }
    }
    if (acikGiris && durum === "iceride") {
      toplam += Math.max(0, now - acikGiris.getTime());
    }
    return toplam;
  }, [hareketler, durum, now]);

  return {
    pdks,
    durum,
    /** "iceride" ise son giriş, "cikti" ise son çıkış zamanı */
    sonHareketZamani: sonHareket?.zaman ?? null,
    calismaMs,
  };
}
