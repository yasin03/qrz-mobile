import { Stack } from "expo-router";

export default function ProfileLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="personel-bilgileri" />
      <Stack.Screen name="giris-cikis-bilgileri" />
      <Stack.Screen name="bordro-bilgileri" />
      <Stack.Screen name="adres-bilgileri" />
      <Stack.Screen name="cihaz-bilgileri" />
    </Stack>
  );
}
