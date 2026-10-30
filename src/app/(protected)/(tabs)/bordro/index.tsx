import { SafeAreaView } from "react-native-safe-area-context";

import { DetailScreenHeader } from "@/components/detail-screen-header";
import { BordroDetay } from "@/components/bordro/BordroDetay";
import { BordroYonetimListesi } from "@/components/bordro/BordroYonetimListesi";
import { PersonelYetkiGuard } from "@/components/personel-yetki-guard";
import { useRole } from "@/hooks/use-role";
import { useAuthStore } from "@/stores/auth-store";

export default function Bordro() {
  const user = useAuthStore((state) => state.user);
  const { isPersonel } = useRole();

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-slate-50">
      <DetailScreenHeader title={isPersonel ? "Bordrom" : "Bordro"} />
      {isPersonel ? (
        <PersonelYetkiGuard yetki="PersonelBordroGorur">
          <BordroDetay idSubePersonel={user?.IDSubePersonel} />
        </PersonelYetkiGuard>
      ) : (
        <BordroYonetimListesi />
      )}
    </SafeAreaView>
  );
}
