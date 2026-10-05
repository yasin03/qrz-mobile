import { Stack } from "expo-router";

export default function KesintilerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="ekle" options={{ presentation: "formSheet" }} />
    </Stack>
  );
}
