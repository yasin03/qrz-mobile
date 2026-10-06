import { Redirect, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { DetailScreenHeader } from "@/components/detail-screen-header";
import { OzlukBilgileri } from "@/components/ozluk/OzlukBilgileri";
import { useRole } from "@/hooks/use-role";

// Admin / yönetici: seçilen personelin özlük bilgileri (bordro parametreleri dahil)
export default function PersonelOzlukDetay() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isPersonel } = useRole();

  if (isPersonel) return <Redirect href="/ozluk" />;

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-slate-50">
      <DetailScreenHeader title="Özlük Bilgileri" />
      <OzlukBilgileri idSubePersonel={id} isAdminView />
    </SafeAreaView>
  );
}
