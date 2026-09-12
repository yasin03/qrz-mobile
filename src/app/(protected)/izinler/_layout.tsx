import { Stack } from "expo-router";

export default function IzinlerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="ekle" options={{ presentation: "formSheet" }} />
    </Stack>
  );
}
