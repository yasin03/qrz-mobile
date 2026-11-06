import { Text } from "@/components/ui/text";
import { MapPinOff } from "lucide-react-native";
import { Linking, Platform, Pressable, View } from "react-native";

// Android'de doğrudan konum ayarı açılır; iOS konum anahtarına link vermediği
// için uygulamanın ayar sayfası açılır. Ekran/metin iki platformda aynı.
async function konumAyariniAc() {
  if (Platform.OS === "android") {
    try {
      await Linking.sendIntent("android.settings.LOCATION_SOURCE_SETTINGS");
      return;
    } catch {
      // bazı cihazlarda intent yoksa genel ayarlara düş
    }
  }
  await Linking.openSettings();
}

export function KonumKapali() {
  return (
    <View className="flex-1 items-center justify-center gap-3 px-6">
      <MapPinOff size={48} color="#f59e0b" />
      <Text className="text-white text-lg font-medium text-center">
        Konum kapalı
      </Text>
      <Text className="text-gray-400 text-sm text-center">
        Giriş/çıkış kaydı için cihazınızın konumunu açmanız gerekiyor.
      </Text>
      <Pressable
        onPress={konumAyariniAc}
        className="mt-2 rounded-xl bg-white px-6 py-3 active:opacity-80"
      >
        <Text className="font-medium text-black">Konumu Aç</Text>
      </Pressable>
    </View>
  );
}
