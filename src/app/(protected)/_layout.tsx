import { useEffect } from "react";
import { Redirect, Stack } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";

import { useAuthStore } from "@/stores/auth-store";

export default function ProtectedLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const queryClient = useQueryClient();

  // Çıkışta önceki kullanıcının cache'lenmiş verisi bir sonraki girişte görünmesin
  useEffect(() => {
    if (!isAuthenticated) queryClient.clear();
  }, [isAuthenticated, queryClient]);

  // Root layout'taki effect'e ek olarak: oturum kapanınca korumalı ekranlar
  // render edilmeden login'e dönülür (Android'de effect yönlendirmesi kaçabiliyor)
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
