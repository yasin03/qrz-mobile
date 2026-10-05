import { Text, View } from "react-native";
import {
  CalendarCheck,
  CalendarClock,
  CircleDashed,
  Clock,
  Coffee,
  Flag,
  Hourglass,
  Plane,
  type LucideIcon,
} from "lucide-react-native";
import type { PuantajSelectResponseType } from "@/types/puantaj";

type OzetAlani = {
  key: keyof PuantajSelectResponseType;
  label: string;
  icon: LucideIcon;
  color: string;
};

const OZET_ALANLARI: OzetAlani[] = [
  { key: "ToplamGun", label: "Çalışılan Gün", icon: CalendarCheck, color: "#059669" },
  { key: "ToplamSaat", label: "Çalışılan Saat", icon: Clock, color: "#0284C7" },
  { key: "ToplamHT", label: "Hafta Tatili", icon: Coffee, color: "#DC2626" },
  { key: "Bos", label: "Boş Gün", icon: CircleDashed, color: "#64748B" },
  { key: "ToplamGT", label: "Genel Tatil", icon: Flag, color: "#7C3AED" },
  { key: "ToplamYI", label: "Yıllık İzin", icon: Plane, color: "#2563EB" },
  { key: "ToplamMI", label: "Mazeret İzni", icon: CalendarClock, color: "#4F46E5" },
  { key: "ToplamFM", label: "Fazla Mesai", icon: Hourglass, color: "#D97706" },
];

export function PuantajOzet({ kayit }: { kayit: PuantajSelectResponseType }) {
  return (
    <View className="flex-row flex-wrap justify-between">
      {OZET_ALANLARI.map(({ key, label, icon: Icon, color }) => {
        const value = kayit[key] as string | null | undefined;
        const isEmpty = !value || Number(value) === 0;

        return (
          <View
            key={key}
            className="mb-2 w-[49%] flex-row items-center gap-3 rounded-xl border border-slate-100 bg-white p-3"
          >
            <View
              className="h-9 w-9 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${color}1A` }}
            >
              <Icon size={18} color={color} />
            </View>
            <View className="flex-1">
              <Text
                className={
                  isEmpty
                    ? "text-lg font-semibold text-slate-400"
                    : "text-lg font-semibold text-qrz-navy"
                }
              >
                {value ?? 0}
              </Text>
              <Text className="text-[11px] text-slate-500" numberOfLines={1}>
                {label}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
