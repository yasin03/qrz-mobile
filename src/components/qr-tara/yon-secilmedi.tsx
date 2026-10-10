import { Text } from "@/components/ui/text";
import { ArrowLeftRight } from "lucide-react-native";
import { Pressable, View } from "react-native";

type Props = {
  onPress: () => void;
};

export function YonSecilmedi({ onPress }: Props) {
  return (
    <View className="flex-1 items-center justify-center gap-3 px-6">
      <ArrowLeftRight size={48} color="#ffffff" />
      <Text className="text-white text-lg font-medium text-center">
        Giriş veya çıkış seçilmedi
      </Text>
      <Text className="text-gray-400 text-sm text-center">
        QR okutabilmek için önce işlem türünü seçmeniz gerekiyor.
      </Text>
      <Pressable
        onPress={onPress}
        className="mt-2 rounded-xl bg-white px-6 py-3"
      >
        <Text className="font-medium text-black">Giriş / Çıkış Seç</Text>
      </Pressable>
    </View>
  );
}
