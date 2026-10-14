import { Text, View } from "react-native";
import { CalendarCheck, CalendarX, Clock, Flag } from "lucide-react-native";

import {
  formatSure,
  saatAyrilmaHali,
  saatGosterim,
} from "@/components/pdks/pdks-helpers";
import { type BugunDurum, useBugunPdks } from "./use-bugun-pdks";

const DURUM_GORUNUM: Record<BugunDurum, { label: string; color: string }> = {
  gelmedi: { label: "Gelmedi", color: "#F59E0B" },
  iceride: { label: "İçeride", color: "#22C55E" },
  cikti: { label: "Çıktı", color: "#64748B" },
};

// Header'a binen beyaz kart: bugünkü giriş / çıkış / mesai (canlı) / durum
export function BugunPdksKarti() {
  const { pdks, durum, sonHareketZamani, calismaMs } = useBugunPdks();
  const durumGorunum = DURUM_GORUNUM[durum];

  const durumHint =
    durum === "iceride" && sonHareketZamani
      ? `${saatAyrilmaHali(sonHareketZamani)} beri`
      : durum === "cikti" && sonHareketZamani
        ? `${saatGosterim(sonHareketZamani)} çıkış`
        : "Henüz giriş yok";

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
          value={durum === "gelmedi" ? "--:--" : formatSure(calismaMs)}
          valueColor={durum === "iceride" ? "#22C55E" : "#94A3B8"}
          hint={durum === "iceride" ? "Sayıyor" : durum === "cikti" ? "Bugün toplam" : ""}
        />
        <StatItem
          icon={<Flag size={22} color={durumGorunum.color} />}
          label="Durum"
          value={durumGorunum.label}
          valueColor={durumGorunum.color}
          hint={durumHint}
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
