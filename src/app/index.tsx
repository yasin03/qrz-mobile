import { Redirect } from "expo-router";
import { useAuthStore } from "@/stores/auth-store";

export default function Index() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return (
    <Redirect
      href={isAuthenticated ? "/(protected)/(tabs)" : "/(auth)/login"}
    />
  );
}
