import { useCallback } from "react";
import { Platform, StatusBar, type StatusBarStyle } from "react-native";
import { useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Ekran odaktayken durum çubuğu ikon rengini ayarlar; ekrandan çıkınca varsayılana
// (koyu ikonlar) döner. Tab ekranları aynı anda mount kaldığı için <StatusBar />
// bileşeni yerine odak bazlı imperatif çağrı kullanılıyor.
export function useStatusBarStyle(style: StatusBarStyle) {
  const { top } = useSafeAreaInsets();

  // Android'de içerik durum çubuğunun arkasına uzanmıyorsa (top === 0) durum çubuğu
  // sistemin beyaz zemininde kalır; beyaz ikonlar kaybolmasın diye koyu kullan.
  const effective: StatusBarStyle =
    Platform.OS === "android" && top === 0 ? "dark-content" : style;

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle(effective, true);
      return () => StatusBar.setBarStyle("dark-content", true);
    }, [effective]),
  );
}
