import { useCameraPermissions } from "expo-camera";
import { useForegroundPermissions } from "expo-location";
import { Linking, Alert, AppState, Platform } from "react-native";
import { useEffect, useCallback, useRef } from "react";

export function usePermissions() {
  const [cameraPerm, requestCamera, getCamera] = useCameraPermissions();
  const [locationPerm, requestLocation, getLocation] = useForegroundPermissions();
  // Android'de izin dialogları art arda açılınca (özellikle Android 9 ve
  // altı bazı cihazlarda) sistem AppState'i "background/active" olarak
  // tetikleyebiliyor. Bu ref, ensurePermissions zaten çalışırken AppState
  // listener'ının aynı native çağrıları tekrar tetikleyip dialogların
  // birbirini iptal etmesini (ve granted=true olsa bile hook state'inin
  // stale/false kalmasını) engelliyor.
  const isRequestingRef = useRef(false);

  // Uygulama foreground'a dönünce izin durumunu tazele (kullanıcı Ayarlar'dan
  // değiştirmiş olabilir). Burada request değil get kullanılır: Android'de
  // request native izin ekranını açıp AppState'i tekrar background/active
  // yapabiliyor → listener kendini yeniden tetikleyip döngüye giriyordu.
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active" && !isRequestingRef.current) {
        getCamera();
        getLocation();
      }
    });
    return () => sub.remove();
  }, [getCamera, getLocation]);

  const ensurePermissions = useCallback(async (): Promise<boolean> => {
    if (isRequestingRef.current) return false;
    isRequestingRef.current = true;

    try {
      let cam = cameraPerm;
      let loc = locationPerm;

      if (!cam?.granted) {
        if (cam?.canAskAgain !== false) {
          const res = await requestCamera();
          cam = res;
        }
      }

      // Android 9 ve altı bazı cihazlarda iki izin dialogu art arda çok
      // hızlı açılırsa ikincisi native tarafta otomatik reddedilebiliyor.
      // Kısa bir bekleme bu davranışı stabilize ediyor.
      if (Platform.OS === "android") {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      if (!loc?.granted) {
        if (loc?.canAskAgain !== false) {
          const res = await requestLocation();
          loc = res;
        }
      }

      if (!cam?.granted || !loc?.granted) {
        const blocked =
          cam?.canAskAgain === false || loc?.canAskAgain === false;
        Alert.alert(
          "İzin Gerekli",
          blocked
            ? "QR okutabilmek için kamera ve konum izinlerini Ayarlar üzerinden açmalısınız."
            : "PDKS kaydı oluşturmak için kamera ve konum izni vermeniz gerekiyor.",
          blocked
            ? [
                { text: "Vazgeç", style: "cancel" },
                { text: "Ayarlara Git", onPress: () => Linking.openSettings() },
              ]
            : [{ text: "Tamam" }],
        );
        return false;
      }

      return true;
    } finally {
      isRequestingRef.current = false;
    }
  }, [cameraPerm, locationPerm, requestCamera, requestLocation]);

  // permissionsGranted, hook'un canlı izin state'inden türetiliyor; böylece
  // izin durumu sonradan (AppState refresh, Ayarlar'dan dönüş vb.) değişse
  // bile ekran otomatik güncellenir. Tek seferlik bir async çağrının
  // sonucuna bağlı kalmaz.
  const permissionsGranted = !!cameraPerm?.granted && !!locationPerm?.granted;

  return { ensurePermissions, cameraPerm, locationPerm, permissionsGranted };
}
