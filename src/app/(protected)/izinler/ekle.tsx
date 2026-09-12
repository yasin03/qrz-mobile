import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { X } from "lucide-react-native";

export default function IzinEkle() {
  return (
    <View className="flex-1 bg-white px-4 pt-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-lg font-semibold text-qrz-navy">Yeni İzin Talebi</Text>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <X size={22} color="#0f172a" />
        </Pressable>
      </View>

      <View className="flex-1 items-center justify-center">
        <Text className="text-sm text-gray-400">Yakında</Text>
      </View>
    </View>
  );
}