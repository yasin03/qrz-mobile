import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DetailScreenHeader } from "@/components/detail-screen-header";
import { OzlukBilgileri } from "@/components/ozluk/OzlukBilgileri";
import { OzlukPersonelListesi } from "@/components/ozluk/OzlukPersonelListesi";
import { useRole } from "@/hooks/use-role";
import { useAuthStore } from "@/stores/auth-store";

export default function Ozluk() {
  const user = useAuthStore((state) => state.user);
  const { isPersonel } = useRole();

  // Admin / yönetici: önce personel seçer, detay /ozluk/[id] ekranında açılır
  if (!isPersonel) {
    return (
      <SafeAreaView edges={["bottom"]} className="flex-1 bg-slate-50">
        <DetailScreenHeader title="Personel Özlük Bilgileri" />
        <OzlukPersonelListesi />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-slate-50">
      <DetailScreenHeader title="Özlük Bilgilerim" />
      {user?.IDSubePersonel ? (
        <OzlukBilgileri idSubePersonel={user.IDSubePersonel} />
      ) : (
        <View className="m-4 rounded-2xl border border-slate-100 bg-white p-6">
          <Text className="text-center text-sm text-slate-500">
            Hesabınıza bağlı bir personel kaydı bulunamadı.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}
