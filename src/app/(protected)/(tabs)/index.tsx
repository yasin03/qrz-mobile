import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Bell,
  CalendarCheck,
  CalendarX,
  Clock,
  Flag,
  Fingerprint,
  DollarSign,
  QrCode,
  User,
  ShieldCheck,
} from "lucide-react-native";

import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/auth-store";

type ShortcutItem = {
  key: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  iconColor: string;
  title: string;
  subtitle: string;
  badge?: number;
};

// --- Kısayol kart verisi (şimdilik statik/default) ---
const shortcuts: readonly ShortcutItem[] = [
  {
    key: "izin",
    icon: CalendarCheck,
    iconColor: "#3B82F6",
    title: "İzin Talepleri",
    subtitle: "İzin durumlarınızı görüntüleyin",
  },
  {
    key: "avans",
    icon: DollarSign,
    iconColor: "#3B82F6",
    title: "Avans Talepleri",
    subtitle: "Avans taleplerinizi yönetin",
  },
  {
    key: "pdks",
    icon: Fingerprint,
    iconColor: "#3B82F6",
    title: "PDKS Bilgileri",
    subtitle: "Giriş/çıkış kayıtlarınızı görün",
  },
  {
    key: "bildirim",
    icon: Bell,
    iconColor: "#3B82F6",
    title: "Bildirimler",
    subtitle: "Bildirimlerinizi inceleyin",
    badge: 3,
  },
  {
    key: "qr",
    icon: QrCode,
    iconColor: "#3B82F6",
    title: "QR İşlemleri",
    subtitle: "QR okut ve işlemlerini gerçekleştir",
  },
  {
    key: "profil",
    icon: User,
    iconColor: "#3B82F6",
    title: "Profilim",
    subtitle: "Kişisel bilgilerinizi görüntüleyin",
  },
];

export default function PersonnelHomeScreen() {
  const user = useAuthStore((state) => state.user);

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

          <TouchableOpacity onPress={() => alert("Bildirimler")}>
            <Bell size={24} color="white" />
            <Text className="absolute -top-1 -right-1 text-xs text-white font-bold bg-red-500 rounded-full w-4 h-4 text-center">
              3
            </Text>
          </TouchableOpacity>
        </View>

        {/* stat kartının header içine taşan üst boşluğu */}
        <View className="h-16" />
      </SafeAreaView>

      <View className="flex-1 bg-slate-50 rounded-t-3xl  pt-6">
        <ScrollView
          className="flex-1"
          contentContainerClassName="pb-8"
          showsVerticalScrollIndicator={false}
        >
          {/* --- Üste binen beyaz stat kartı --- */}
          <View className="mx-4 rounded-2xl bg-white px-4 py-5 shadow-sm shadow-black/10">
            <View className="flex-row">
              <StatItem
                icon={<CalendarCheck size={22} color="#3B82F6" />}
                label="Bugünkü Giriş"
                value="08:32"
                valueColor="#22C55E"
                hint="Zamanında"
              />
              <StatItem
                icon={<CalendarX size={22} color="#052346" />}
                label="Bugünkü Çıkış"
                value="--:--"
                valueColor="#94A3B8"
                hint="Henüz çıkış yok"
              />
              <StatItem
                icon={<Clock size={22} color="#052346" />}
                label="Mesai Süresi"
                value="--:--"
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

          {/* --- Kısayollar --- */}
          <View className="px-4 mt-6">
            <Text className="text-lg font-bold text-qrz-navy mb-3">
              Kısayollar
            </Text>

            <View className="flex-row flex-wrap justify-between">
              {shortcuts.map(({ key, ...item }) => (
                <ShortcutCard key={key} {...item} />
              ))}
            </View>
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

// --- Kısayol kartı (2 sütunlu grid'deki her kutu) ---
function ShortcutCard({
  icon: Icon,
  iconColor,
  title,
  subtitle,
  badge,
}: ShortcutItem) {
  return (
    <TouchableOpacity
      className="w-[48%] mb-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm shadow-black/5"
      activeOpacity={0.7}
    >
      <View className="flex-row items-start justify-between">
        <Icon size={26} color={iconColor} />
        {badge ? (
          <View className="bg-blue-500 rounded-full w-5 h-5 items-center justify-center">
            <Text className="text-white text-[10px] font-bold">{badge}</Text>
          </View>
        ) : null}
      </View>

      <Text className="mt-3 text-[15px] font-bold text-qrz-navy">{title}</Text>
      <Text className="mt-1 text-xs text-slate-500 leading-4">{subtitle}</Text>
    </TouchableOpacity>
  );
}
