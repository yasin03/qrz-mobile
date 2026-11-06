import { useCallback, useEffect, useState } from "react";
import { AppState } from "react-native";
import * as Location from "expo-location";

/**
 * Cihazın konum servisinin (GPS/konum anahtarı) açık olup olmadığını izler.
 * `enabled` true iken ilk açılışta ve uygulama ön plana her döndüğünde
 * (kullanıcı Ayarlar'dan konumu açıp dönmüş olabilir) tekrar kontrol eder.
 */
export function useKonumServisi(enabled = true) {
  // null: henüz kontrol edilmedi
  const [konumAcik, setKonumAcik] = useState<boolean | null>(null);

  const kontrolEt = useCallback(async () => {
    try {
      const acik = await Location.hasServicesEnabledAsync();
      setKonumAcik(acik);
      return acik;
    } catch {
      // Kontrol edilemiyorsa engelleme; konum alma adımı zaten 0,0'a düşer
      setKonumAcik(true);
      return true;
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    kontrolEt();

    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") kontrolEt();
    });
    return () => sub.remove();
  }, [enabled, kontrolEt]);

  return { konumAcik, kontrolEt };
}
