import {
  DarkTheme,
  DefaultTheme,
  Stack,
  ThemeProvider,
  usePathname,
  useRouter,
} from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useColorScheme } from "react-native";

import QueryProvider from "@/providers/query-provider";
import { useAuthStore } from "@/stores/auth-store";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const router = useRouter();
  const pathname = usePathname();

  const isHydrated = useAuthStore((state) => state.isHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const hydrate = useAuthStore((state) => state.hydrate);

  // SecureStore / localStorage'dan kullanıcıyı oku - sadece mount olduğunda çalış
  useEffect(() => {
    hydrate();
  }, []);

  // Authentication kontrolü
  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const isLoginPage = pathname === "/login";
    const isProtectedPage = !isLoginPage;

    // Kullanıcı giriş yapmamışsa
    // ve protected bir sayfadaysa login'e gönder
    if (!isAuthenticated && isProtectedPage) {
      router.replace("/login");
      return;
    }

    // Kullanıcı giriş yapmışsa
    // ve login sayfasındaysa ana sayfaya gönder
    if (isAuthenticated && isLoginPage) {
      router.replace("/(protected)");
      return;
    }

    // Artık navigation tamam
    SplashScreen.hideAsync();
  }, [isHydrated, isAuthenticated, pathname]);

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
        >
          <Stack.Screen name="(auth)/login" />
          <Stack.Screen name="(protected)" />
        </Stack>
      </ThemeProvider>
    </QueryProvider>
  );
}
