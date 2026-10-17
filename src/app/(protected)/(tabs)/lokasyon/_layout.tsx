import { Stack } from "expo-router";

import { FORM_SHEET_OPTIONS } from "@/components/ui/form-sheet-screen";

export default function LocationLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      {/* Yarım yükseklik (0.5) detent'i klavye açılınca formu sıkıştırıyordu;
          diğer form ekranlarıyla aynı tam yükseklik kullanılıyor */}
      <Stack.Screen name="save" options={FORM_SHEET_OPTIONS} />
    </Stack>
  );
}
