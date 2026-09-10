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
import { colorScheme as nwColorScheme, useColorScheme } from "nativewind";
import { QueryProvider } from "@/providers/query-provider";
import { useAuthStore } from "@/stores/auth-store";
import { CustomSplashScreen } from "@/components/splash-screen";
import { PortalHost } from "@rn-primitives/portal";
import { useThemeStore } from "@/stores/theme-store";
import { ConfirmDialogProvider } from "@/providers/confirm-dialog-provider";
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { colorScheme } = useColorScheme();

  const router = useRouter();
  const segments = useSegments();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    nwColorScheme.set(useThemeStore.getState().mode);
  }, []);

  // İlk açılışta SecureStore'dan auth bilgilerini al
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Native splash'ı JS render edilir edilmez kapat,
  // yerini custom splash alsın (isHydrated false iken)
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

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
      router.replace("/(protected)/(tabs)");
      return;
    }
  }, [isHydrated, isAuthenticated, segments]);

  return (
    <>
      <QueryProvider>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          {!isHydrated ? (
            <CustomSplashScreen />
          ) : (
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            />
          )}
          <PortalHost />
          <ConfirmDialogProvider />
        </ThemeProvider>
      </QueryProvider>
    </>
  );
}
