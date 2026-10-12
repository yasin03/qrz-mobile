import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Bell, ShieldCheck } from "lucide-react-native";
import { useRouter } from "expo-router";

import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/auth-store";

// Ana sayfanın lacivert üst alanı: selamlama, rol rozeti, bildirim zili
export function HomeHeader() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  return (
    <SafeAreaView edges={["top"]} className=" px-6">
      <View className="flex-row items-center justify-between mt-4">
        <View className="flex-column gap-1">
          <Text className="text-white">Merhaba,</Text>
          <Text className="text-lg text-white font-bold">
            {user?.Ad ?? "Ahmet Duman"}
          </Text>
          <Badge
            variant="secondary"
            className="bg-blue-500 dark:bg-blue-600 self-start"
          >
            <ShieldCheck size={13} color="white" />
            <Text className="text-white text-sm">
              {user?.KullaniciTipi ?? "Personel"}
            </Text>
          </Badge>
        </View>

        <TouchableOpacity
          onPress={() => router.push("/bildirimler")}
          className="relative"
        >
          <Bell size={24} color="white" />
          <Text className="absolute -top-1 -right-1 text-xs text-white font-bold bg-red-500 rounded-full w-4 h-4 text-center">
            3
          </Text>
        </TouchableOpacity>
      </View>

      {/* stat kartının header içine taşan üst boşluğu */}
      <View className="h-10" />
    </SafeAreaView>
  );
}
