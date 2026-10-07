import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { DetailScreenHeader } from "@/components/detail-screen-header";
import { PersonelPuantajGorunumu } from "@/components/puantaj/PersonelPuantajGorunumu";

// Yönetici / admin: seçilen personelin aylık puantaj detayı (salt okunur)
export default function PersonelPuantajDetay() {
  const { id, yil, ay } = useLocalSearchParams<{
    id: string;
    yil?: string;
    ay?: string;
  }>();

  const baslangicDonem =
    yil && ay ? { yil: Number(yil), ay: Number(ay) } : undefined;

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-slate-50">
      <DetailScreenHeader title="Personel Puantajı" />
      <PersonelPuantajGorunumu
        idSubePersonel={id}
        baslangicDonem={baslangicDonem}
        personelBilgisiGoster
      />
    </SafeAreaView>
  );
}
