import { RefreshControl, ScrollView, View } from "react-native";

import { useAuthStore } from "@/stores/auth-store";
import { useRole } from "@/hooks/use-role";
import { usePersonelDashboard, useYoneticiDashboard } from "@/hooks/use-dashboard";
import { HomeHeader } from "@/components/home/HomeHeader";
import { BugunPdksKarti } from "@/components/home/BugunPdksKarti";
import { PersonelDashboard } from "@/components/dashboard/PersonelDashboard";
import { YoneticiDashboard } from "@/components/dashboard/YoneticiDashboard";

export default function PersonelHomeScreen() {
  const user = useAuthStore((state) => state.user);

  // Personel kendi özetini, admin / yönetici şube özetini görür
  const { isPersonel } = useRole();
  const now = new Date();
  const personelOzet = usePersonelDashboard(isPersonel);
  const yoneticiOzet = useYoneticiDashboard(
    {
      IDSube: user?.IDSube,
      Yil: String(now.getFullYear()),
      Ay: String(now.getMonth() + 1).padStart(2, "0"),
    },
    !isPersonel,
  );
  const ozet = isPersonel ? personelOzet : yoneticiOzet;

  return (
    <View className="flex-1 bg-qrz-navy">
      <HomeHeader />

      <View className="flex-1 bg-slate-50 rounded-t-3xl  pt-6">
        <ScrollView
          className="flex-1"
          contentContainerClassName="pb-8"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={ozet.isRefetching} onRefresh={ozet.refetch} />
          }
        >
          <BugunPdksKarti />

          <View className="mt-4">
            {isPersonel ? (
              <PersonelDashboard data={personelOzet.data} loading={personelOzet.isLoading} />
            ) : (
              <YoneticiDashboard data={yoneticiOzet.data} loading={yoneticiOzet.isLoading} />
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
