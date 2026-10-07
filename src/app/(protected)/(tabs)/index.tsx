import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Bell,
  CalendarCheck,
  CalendarX,
  Clock,
  Flag,
  ShieldCheck,
} from "lucide-react-native";

import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "expo-router";
import { usePdksSelect } from "@/hooks/use-pdks";
import { useRole } from "@/hooks/use-role";
import { usePersonelDashboard, useYoneticiDashboard } from "@/hooks/use-dashboard";
import { PersonelDashboard } from "@/components/dashboard/PersonelDashboard";
import { YoneticiDashboard } from "@/components/dashboard/YoneticiDashboard";

export default function PersonnelHomeScreen() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const {
    data: pdksData = [],
    isLoading: isPdksLoading,
    isError: isPdksError,
  } = usePdksSelect(
    Number(user?.IDSubePersonel),
    new Date().toISOString().split("T")[0],
    new Date().toISOString().split("T")[0],
  );
  const pdks = pdksData[0] || { Giris: null, Cikis: null, Tarih: null };

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
      {/* --- Lacivert header --- */}
      <SafeAreaView edges={["top"]} className=" px-6">
        <View className="flex-row items-center justify-between mt-4">
          <View className="flex-column gap-1">
            <Text className="text-white">Merhaba,</Text>
            <Text className="text-lg text-white font-bold">
              {user?.Ad ?? "Ahmet Duman"}
            </Text>
            <Badge
              variant="secondary"
              className="bg-blue-500 dark:bg-blue-600 self-start"
            >
              <ShieldCheck size={13} color="white" />
              <Text className="text-white text-sm">
                {user?.KullaniciTipi ?? "Personel"}
              </Text>
            </Badge>
          </View>

          <TouchableOpacity onPress={() => router.push("/bildirimler")} className="relative">
            <Bell size={24} color="white" />
            <Text className="absolute -top-1 -right-1 text-xs text-white font-bold bg-red-500 rounded-full w-4 h-4 text-center">
              3
            </Text>
          </TouchableOpacity>
        </View>

        {/* stat kartının header içine taşan üst boşluğu */}
        <View className="h-10" />
      </SafeAreaView>

      <View className="flex-1 bg-slate-50 rounded-t-3xl  pt-6">
        <ScrollView
          className="flex-1"
          contentContainerClassName="pb-8"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={ozet.isRefetching} onRefresh={ozet.refetch} />
          }
        >
          {/* --- Üste binen beyaz stat kartı --- */}
          <View className="mx-4 rounded-2xl bg-white px-4 py-5 shadow-sm shadow-black/10">
            <View className="flex-row">
              <StatItem
                icon={<CalendarCheck size={22} color="#3B82F6" />}
                label="Bugünkü Giriş"
                value={pdks.Giris ? pdks.Giris : "--:--"}
                valueColor="#22C55E"
                hint={pdks.Giris ? "Giriş Yapıldı." : "Henüz giriş yok"}
              />
              <StatItem
                icon={<CalendarX size={22} color="#052346" />}
                label="Bugünkü Çıkış"
                value={pdks.Cikis ? pdks.Cikis : "--:--"}
                valueColor="#94A3B8"
                hint="Henüz çıkış yok"
              />
              <StatItem
                icon={<Clock size={22} color="#052346" />}
                label="Mesai Süresi"
                value={pdks.MesaiSure ? pdks.MesaiSure : "--:--"}
                valueColor="#94A3B8"
                hint="--"
              />
              <StatItem
                icon={<Flag size={22} color="#052346" />}
                label="Durum"
                value="Aktif"
                valueColor="#052346"
                hint="Çalışıyorsun"
              />
            </View>
          </View>

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

// --- Stat item (üst kartın içindeki 4 sütundan biri) ---
function StatItem({
  icon,
  label,
  value,
  valueColor,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueColor: string;
  hint: string;
}) {
  return (
    <View className="flex-1 items-center gap-1.5">
      {icon}
      <Text
        className="text-[11px] text-slate-500 text-center"
        numberOfLines={1}
      >
        {label}
      </Text>
      <Text
        className="text-base font-bold"
        style={{ color: valueColor }}
        numberOfLines={1}
      >
        {value}
      </Text>
      <Text
        className="text-[10px] text-slate-400 text-center"
        numberOfLines={1}
      >
        {hint}
      </Text>
    </View>
  );
}
