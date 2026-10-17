import { Stack } from "expo-router";

import { FORM_SHEET_OPTIONS } from "@/components/ui/form-sheet-screen";

export default function IzinlerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="ekle" options={FORM_SHEET_OPTIONS} />
    </Stack>
  );
}
