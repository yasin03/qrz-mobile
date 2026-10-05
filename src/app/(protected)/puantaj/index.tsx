import { SafeAreaView } from "react-native-safe-area-context";

import { DetailScreenHeader } from "@/components/detail-screen-header";
import { PersonelPuantajGorunumu } from "@/components/puantaj/PersonelPuantajGorunumu";
import { PuantajYonetimListesi } from "@/components/puantaj/PuantajYonetimListesi";
import { useRole } from "@/hooks/use-role";
import { useAuthStore } from "@/stores/auth-store";

export default function Puantaj() {
  const user = useAuthStore((state) => state.user);
  const { isAdmin, isYonetici } = useRole();
  const isYoneticiVeyaAdmin = isAdmin || isYonetici;

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-slate-50">
      <DetailScreenHeader title={isYoneticiVeyaAdmin ? "Puantaj" : "Puantajım"} />

      {isYoneticiVeyaAdmin ? (
        <PuantajYonetimListesi />
      ) : (
        <PersonelPuantajGorunumu idSubePersonel={user?.IDSubePersonel} />
      )}
    </SafeAreaView>
  );
}
