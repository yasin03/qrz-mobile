import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PersonelPdksListesi } from "@/components/pdks/PersonelPdksListesi";

const Index = () => {
  return (
    <SafeAreaView className="flex-1 p-2 px-6 bg-white">
      <View className="mb-3">
        <Text className="text-lg font-medium text-qrz-navy">
          PDKS Kayıtlarım
        </Text>
      </View>

      <PersonelPdksListesi />
    </SafeAreaView>
  );
};

export default Index;
