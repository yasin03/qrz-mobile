import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft } from "lucide-react-native";
import { useRouter } from "expo-router";

export function DetailScreenHeader({ title }: { title: string }) {
  const router = useRouter();

  return (
    <SafeAreaView
      edges={["top"]}
      className="bg-white border-b border-slate-100"
    >
      <View className="flex-row items-center gap-3 px-4 py-3">
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={10}
          className="h-9 w-9 items-center justify-center rounded-full bg-slate-100"
        >
          <ChevronLeft size={20} color="#0f172a" />
        </TouchableOpacity>
        <Text className="text-base font-semibold text-slate-900">{title}</Text>
      </View>
    </SafeAreaView>
  );
}
