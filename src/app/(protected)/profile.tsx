import { useMemo } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import * as Device from "expo-device";
import {
  LogOut,
  Building2,
  Hash,
  Smartphone,
  ShieldCheck,
  ChevronRight,
} from "lucide-react-native";
import { useAuthStore } from "@/stores/auth-store";
import { Badge } from "@/components/ui/badge";

function getInitials(name?: string) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

function ScanFrameAvatar({ initials }: { initials: string }) {
  return (
    <View className="relative h-24 w-24 items-center justify-center">
      {/* Köşe parantezleri — QR tarayıcı viewfinder imzası */}
      <View className="absolute -top-1.5 -left-1.5 h-5 w-5 rounded-tl-lg border-l-2 border-t-2 border-blue-400" />
      <View className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-tr-lg border-r-2 border-t-2 border-blue-400" />
      <View className="absolute -bottom-1.5 -left-1.5 h-5 w-5 rounded-bl-lg border-b-2 border-l-2 border-blue-400" />
      <View className="absolute -bottom-1.5 -right-1.5 h-5 w-5 rounded-br-lg border-b-2 border-r-2 border-blue-400" />

      <View className="h-[76px] w-[76px] items-center justify-center rounded-full bg-white/10">
        <Text className="text-2xl font-bold text-white">{initials}</Text>
      </View>

      {/* Aktif oturum göstergesi */}
      <View className="absolute bottom-0.5 right-0.5 h-4 w-4 rounded-full border-2 border-qrz-navy bg-blue-400" />
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
  isLast,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null;
  isLast?: boolean;
}) {
  return (
    <View
      className={`flex-row items-center justify-between py-3.5 ${
        isLast ? "" : "border-b border-slate-100"
      }`}
    >
      <View className="flex-row items-center gap-3">
        <View className="h-9 w-9 items-center justify-center rounded-full bg-slate-100">
          {icon}
        </View>
        <Text className="text-sm text-slate-500">{label}</Text>
      </View>
      <Text
        className="max-w-[55%] text-right text-sm font-medium text-slate-900"
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="mb-4">
      <Text className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </Text>
      <View className="rounded-2xl border border-slate-100 bg-white px-4 shadow-sm shadow-slate-200/50">
        {children}
      </View>
    </View>
  );
}

const Profile = () => {
  const insets = useSafeAreaInsets();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const initials = useMemo(() => getInitials(user?.Ad), [user?.Ad]);

  const handleLogout = () => {
    Alert.alert(
      "Çıkış Yap",
      "Hesabınızdan çıkış yapmak istediğinize emin misiniz?",
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Çıkış Yap",
          style: "destructive",
          onPress: () => logout(),
        },
      ],
    );
  };

  if (!user) return null;

  return (
    <View className="flex-1 bg-qrz-navy">
      {/* Navy başlık — status bar'a kadar tam bleed */}
      <View
        style={{ paddingTop: insets.top + 20 }}
        className="flex-row items-center p-10 gap-10"
      >
        <ScanFrameAvatar initials={initials} />

        <View>
          <Text className="mt-4 text-lg font-semibold text-white">
            {user.Ad}
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
      </View>

      <ScrollView
        className="flex-1 px-4 rounded-t-3xl bg-slate-50"
        contentContainerClassName="pt-5 pb-6"
        showsVerticalScrollIndicator={false}
      >
        <SectionCard title="Hesap Bilgileri">
          <InfoRow
            icon={<Hash size={16} color="#64748b" />}
            label="Personel No"
            value={user?.IDSubePersonel}
          />
          <InfoRow
            icon={<Building2 size={16} color="#64748b" />}
            label="Şirket No"
            value={user.IDSirket}
          />
          <InfoRow
            icon={<Building2 size={16} color="#64748b" />}
            label="Şube No"
            value={user.IDSube}
            isLast
          />
        </SectionCard>

        <SectionCard title="Cihaz Bilgileri">
          <InfoRow
            icon={<Smartphone size={16} color="#64748b" />}
            label="Cihaz"
            value={Device.deviceName ?? "-"}
          />
          <InfoRow
            icon={<Smartphone size={16} color="#64748b" />}
            label="Marka"
            value={Device.brand ?? "-"}
          />
          <InfoRow
            icon={<Smartphone size={16} color="#64748b" />}
            label="Sistem"
            value={`${Device.osName ?? "-"} ${Device.osVersion ?? ""}`}
            isLast
          />
        </SectionCard>

        <TouchableOpacity
          onPress={handleLogout}
          activeOpacity={0.7}
          className="mt-2 flex-row items-center justify-between rounded-2xl border border-red-100 bg-red-50 px-4 py-4"
        >
          <View className="flex-row items-center gap-3">
            <View className="h-9 w-9 items-center justify-center rounded-full bg-red-100">
              <LogOut size={16} color="#dc2626" />
            </View>
            <Text className="text-sm font-semibold text-red-600">
              Çıkış Yap
            </Text>
          </View>
          <ChevronRight size={16} color="#dc2626" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default Profile;
