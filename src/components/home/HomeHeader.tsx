import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ShieldCheck } from "lucide-react-native";

import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/auth-store";

// Ana sayfanın lacivert üst alanı: selamlama, rol rozeti
export function HomeHeader() {
  const user = useAuthStore((state) => state.user);

  return (
    <SafeAreaView edges={["top"]} className=" px-6">
      <View className="flex-row items-center justify-between mt-4">
        <View className="flex-column gap-1">
          <Text className="text-white">Merhaba,</Text>
          <Text className="text-lg text-white font-bold">
            {user?.Ad ?? ""}
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
      </View>

      {/* stat kartının header içine taşan üst boşluğu */}
      <View className="h-10" />
    </SafeAreaView>
  );
}
