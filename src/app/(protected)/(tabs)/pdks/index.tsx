import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DetailScreenHeader } from "@/components/detail-screen-header";
import { PersonelPdksListesi } from "@/components/pdks/PersonelPdksListesi";
import { PersonelYetkiGuard } from "@/components/personel-yetki-guard";

// Tab bar'da değil, Hızlı Menü'den açılıyor; diğer menü ekranları gibi
// geri butonlu başlık kullanıyor.
const Index = () => {
  return (
    <SafeAreaView edges={[]} className="flex-1 bg-white">
      <DetailScreenHeader title="PDKS Kayıtlarım" />
      <View className="flex-1 p-2 px-6">
        <PersonelYetkiGuard yetki="PersonelPdksGorur">
          <PersonelPdksListesi />
        </PersonelYetkiGuard>
      </View>
    </SafeAreaView>
  );
};

export default Index;
