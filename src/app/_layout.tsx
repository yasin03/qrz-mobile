import "@/global.css";
import {
  DarkTheme,
  DefaultTheme,
  Stack,
  ThemeProvider,
  useRouter,
  useSegments,
} from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { QueryProvider } from "@/providers/query-provider";
import { useAuthStore } from "@/stores/auth-store";
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const router = useRouter();
  const segments = useSegments();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const isHydrated = useAuthStore((state) => state.isHydrated);

  const hydrate = useAuthStore((state) => state.hydrate);

  // İlk açılışta SecureStore'dan auth bilgilerini al
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const inAuthGroup = segments[0] === "(auth)";

    const inProtectedGroup = segments[0] === "(protected)";

    // Authenticated değil → protected sayfaya girmesin
    if (!isAuthenticated && inProtectedGroup) {
      router.replace("/(auth)/login");
      return;
    }

    // Authenticated → login sayfasına girmesin
    if (isAuthenticated && inAuthGroup) {
      router.replace("/(protected)");
      return;
    }

    SplashScreen.hideAsync();
  }, [isHydrated, isAuthenticated, segments]);

  if (!isHydrated) {
    return null;
  }

  return (
    <QueryProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </ThemeProvider>
    </QueryProvider>
  );
}
