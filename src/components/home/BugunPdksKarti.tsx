import { Text, View } from "react-native";
import { CalendarCheck, CalendarX, Clock, Flag } from "lucide-react-native";

import { usePdksSelect } from "@/hooks/use-pdks";
import { bugunKey, toGunKey } from "@/components/pdks/pdks-helpers";

// Header'a binen beyaz kart: bugünkü giriş / çıkış / mesai / durum
export function BugunPdksKarti() {
  // Aylık kayıtlar gelir, bugünün satırı seçilir
  const bugun = bugunKey();
  const { data: pdksData = [] } = usePdksSelect({
    Yil: bugun.slice(0, 4),
    Ay: bugun.slice(5, 7),
  });
  const pdks = pdksData.find((k) => toGunKey(k.Tarih) === bugun);

  return (
    <View className="mx-4 rounded-2xl bg-white px-4 py-5 shadow-sm shadow-black/10">
      <View className="flex-row">
        <StatItem
          icon={<CalendarCheck size={22} color="#3B82F6" />}
          label="Bugünkü Giriş"
          value={pdks?.Giris || "--:--"}
          valueColor="#22C55E"
          hint={pdks?.Giris ? "Giriş Yapıldı." : "Henüz giriş yok"}
        />
        <StatItem
          icon={<CalendarX size={22} color="#052346" />}
          label="Bugünkü Çıkış"
          value={pdks?.Cikis || "--:--"}
          valueColor="#94A3B8"
          hint={pdks?.Cikis ? "Çıkış Yapıldı." : "Henüz çıkış yok"}
        />
        <StatItem
          icon={<Clock size={22} color="#052346" />}
          label="Mesai Süresi"
          value={pdks?.MesaiSure || pdks?.ToplamSure || "--:--"}
          valueColor="#94A3B8"
          hint=""
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
  );
}

// --- Kartın içindeki 4 sütundan biri ---
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
