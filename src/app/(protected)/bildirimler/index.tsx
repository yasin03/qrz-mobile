import { useState } from "react";
import { Text, View, Pressable } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/stores/auth-store";
import { useRole } from "@/hooks/use-role";
import { DetailScreenHeader } from "@/components/detail-screen-header";

export default function Bildirimler() {
  const { isPersonel, isAdmin, isYonetici } = useRole();
  const isYoneticiVeyaAdmin = isAdmin || isYonetici;
  const user = useAuthStore((state) => state.user);
  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-white px-4">
      <DetailScreenHeader title="Bildirimler" />
      <View className="flex-1 items-center justify-center">
        <Text className="text-lg font-medium text-gray-500">
          Bildirimler sayfası henüz geliştirilme aşamasındadır.
        </Text>
      </View>
    </SafeAreaView>
  );
}
