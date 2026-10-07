import { Redirect, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { DetailScreenHeader } from "@/components/detail-screen-header";
import { BordroDetay } from "@/components/bordro/BordroDetay";
import { useRole } from "@/hooks/use-role";

// Admin / yönetici: seçilen personelin aylık bordro detayı (salt okunur)
export default function PersonelBordroDetay() {
  const { id, yil, ay } = useLocalSearchParams<{ id: string; yil?: string; ay?: string }>();
  const { isPersonel } = useRole();

  if (isPersonel) return <Redirect href="/bordro" />;

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-slate-50">
      <DetailScreenHeader title="Personel Bordrosu" />
      <BordroDetay
        idSubePersonel={id}
        baslangicDonem={yil && ay ? { yil: Number(yil), ay: Number(ay) } : undefined}
      />
    </SafeAreaView>
  );
}
