import { Text, TouchableOpacity, View } from "react-native";

import { useAuthStore } from "@/stores/auth-store";

export default function PersonnelHomeScreen() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="mb-2 text-3xl font-bold">
        QR Zaman
      </Text>

      <Text className="mb-8 text-lg text-gray-600">
        Hoş geldin, {user?.Ad}
      </Text>

      <Text className="mb-8 text-gray-500">
        {user?.KullaniciTipi}
      </Text>

      <TouchableOpacity
        onPress={logout}
        className="rounded-lg bg-red-500 px-6 py-3"
      >
        <Text className="font-semibold text-white">
          Çıkış Yap
        </Text>
      </TouchableOpacity>
    </View>
  );
}