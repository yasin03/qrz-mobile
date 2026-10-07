import { Pressable, Text } from "react-native";
import { router } from "expo-router";
import { Plus } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DetailScreenHeader } from "@/components/detail-screen-header";
import { useRole } from "@/hooks/use-role";
import { PARAMETRE_CONFIG, type ParametreTur } from "./parametre-config";
import { ParametreListesi } from "./ParametreListesi";

// Eklentiler / Kesintiler ekranı. "Ekle" butonu sadece admin ve yöneticide görünür.
export function ParametreSayfasi({ tur }: { tur: ParametreTur }) {
  const config = PARAMETRE_CONFIG[tur];
  const { isPersonel } = useRole();

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-slate-50">
      <DetailScreenHeader
        title={isPersonel ? config.personelBaslik : config.baslik}
        right={
          isPersonel ? null : (
            <Pressable
              onPress={() => router.push(config.ekleHref)}
              className="flex-row items-center gap-1 rounded-lg bg-qrz-navy px-3 py-2"
            >
              <Plus size={16} color="white" />
              <Text className="text-xs font-medium text-white">
                {config.tekil} Ekle
              </Text>
            </Pressable>
          )
        }
      />
      <ParametreListesi tur={tur} />
    </SafeAreaView>
  );
}
