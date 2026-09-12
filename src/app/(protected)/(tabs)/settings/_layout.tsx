import { Stack } from "expo-router";

export default function SettingsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="cihaz-bilgileri" />
      <Stack.Screen name="adres-bilgileri" />
      <Stack.Screen name="bordro-bilgileri" />
      <Stack.Screen name="giris-cikis-bilgileri" />
      <Stack.Screen name="personel-bilgileri" />

    </Stack>
  );
}
