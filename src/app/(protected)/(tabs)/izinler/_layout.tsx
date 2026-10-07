import { Stack } from "expo-router";

export default function IzinlerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="ekle"
        options={{
          presentation: "formSheet",
          // Sheet içerik yüksekliği kadar açılır (tam ekran değil)
          sheetAllowedDetents: "fitToContents",
          sheetGrabberVisible: true,
          sheetCornerRadius: 24,
        }}
      />
    </Stack>
  );
}
