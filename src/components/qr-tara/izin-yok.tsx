import { Text } from "@/components/ui/text";
import { XCircle } from "lucide-react-native";
import { View } from "react-native";

export function IzinYok() {
  return (
    <View className="flex-1 items-center justify-center gap-3 px-6">
      <XCircle size={48} color="#ef4444" />
      <Text className="text-white text-lg font-medium text-center">
        Kamera ve konum izni verilmedi
      </Text>
      <Text className="text-gray-400 text-sm text-center">
        QR okutabilmek için izinleri Ayarlar'dan açmanız gerekiyor.
      </Text>
    </View>
  );
}
