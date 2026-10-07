import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { format, parseISO } from "date-fns";
import { tr } from "date-fns/locale";
import {
  Briefcase,
  CalendarClock,
  CalendarDays,
  Cake,
  Eye,
  EyeOff,
  HandCoins,
  Hourglass,
  MinusCircle,
  Plane,
  PlusCircle,
  Receipt,
} from "lucide-react-native";

import { getAyAdi } from "@/components/puantaj/puantaj-helpers";
import { formatMoney } from "@/lib/format-helpers";
import { cn } from "@/lib/utils";
import type { PersonelDashboard as PersonelDashboardData } from "@/types/dashboard";
import { BolumBaslik, KartGrid, StatKart } from "./DashboardKart";

const MAAS_GIZLI_KEY = "dashboard-maas-gizli";

const gunAy = (ymd: string) => format(parseISO(ymd), "d MMMM", { locale: tr });
const tamTarih = (ymd: string) => format(parseISO(ymd), "dd.MM.yyyy");
const tl = (value: number) => `${formatMoney(value)} ₺`;

// Maaş varsayılan olarak gizli; tercih cihazda saklanır
function useMaasGizli() {
  const [gizli, setGizli] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(MAAS_GIZLI_KEY)
      .then((v) => v !== null && setGizli(v === "1"))
      .catch(() => {});
  }, []);

  const toggle = () => {
    setGizli((prev) => {
      const next = !prev;
      AsyncStorage.setItem(MAAS_GIZLI_KEY, next ? "1" : "0").catch(() => {});
      return next;
    });
  };

  return [gizli, toggle] as const;
}

type Props = {
  data: PersonelDashboardData | undefined;
  loading: boolean;
};

export function PersonelDashboard({ data, loading }: Props) {
  const router = useRouter();
  const [maasGizli, toggleMaas] = useMaasGizli();

  const p = data?.personel;
  const izin = data?.yillikIzin;
  const sonraki = data?.sonrakiIzin;
  const maas = data?.maas;
  const avans = data?.avans;
  const puantaj = data?.puantaj;
  const ek = data?.eklentiKesinti;
  const talepler = data?.bekleyenTalepler;
  const bekleyenToplam = (talepler?.Izin ?? 0) + (talepler?.Avans ?? 0);

  const dogumGunuYakin = p?.DogumGunuKalanGun != null && p.DogumGunuKalanGun <= 7;

  return (
    <View className="px-4">
      {/* Doğum günü bugün / bu hafta */}
      {dogumGunuYakin && (
        <View className="mb-3 flex-row items-center gap-3 rounded-2xl bg-pink-50 p-4">
          <Cake size={28} color="#DB2777" />
          <View className="flex-1">
            <Text className="text-sm font-bold text-pink-700">
              {p!.DogumGunuKalanGun === 0
                ? "Doğum günün kutlu olsun! 🎉"
                : `Doğum gününe ${p!.DogumGunuKalanGun} gün kaldı`}
            </Text>
            <Text className="text-xs text-pink-600">{gunAy(p!.DogumTarihi!)}</Text>
          </View>
        </View>
      )}

      {/* Onay bekleyen talepler */}
      {bekleyenToplam > 0 && (
        <Pressable
          onPress={() => router.push(talepler!.Izin > 0 ? "/izinler" : "/avanslar")}
          className="mb-3 flex-row items-center gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-3.5"
        >
          <Hourglass size={18} color="#D97706" />
          <Text className="flex-1 text-sm text-amber-800">
            Onay bekleyen{" "}
            {[
              talepler!.Izin ? `${talepler!.Izin} izin` : null,
              talepler!.Avans ? `${talepler!.Avans} avans` : null,
            ]
              .filter(Boolean)
              .join(" ve ")}{" "}
            talebin var
          </Text>
        </Pressable>
      )}

      <BolumBaslik title="İzin & Çalışma" />
      <KartGrid>
        <StatKart
          icon={Plane}
          color="#2563EB"
          title="Kalan Yıllık İzin"
          loading={loading}
          value={izin ? `${izin.Kalan} gün` : "—"}
          sub={izin ? `Toplam ${izin.ToplamHak} · Kullanılan ${izin.Kullanilan}` : "Bilgi yok"}
          href="/izinler"
        />
        <StatKart
          icon={CalendarClock}
          color="#7C3AED"
          title="Sonraki İzin"
          loading={loading}
          value={
            sonraki
              ? sonraki.KalanGun === 0
                ? "Bugün"
                : `${sonraki.KalanGun} gün kaldı`
              : "Planlı izin yok"
          }
          sub={sonraki ? `${sonraki.Tip} · ${gunAy(sonraki.BaslangicTarihi)}` : null}
          href="/izinler"
        />
        <StatKart
          icon={Briefcase}
          color="#059669"
          title="Çalışma Süresi"
          loading={loading}
          value={p?.CalistigiGun != null ? `${p.CalistigiGun.toLocaleString("tr-TR")} gün` : "—"}
          sub={
            p?.IseGirisTarihi
              ? `${p.Kidem ?? ""} · Giriş ${tamTarih(p.IseGirisTarihi)}`
              : null
          }
          href="/ozluk"
        />
        <StatKart
          icon={Cake}
          color="#DB2777"
          title="Doğum Günü"
          loading={loading}
          value={
            p?.DogumGunuKalanGun != null
              ? p.DogumGunuKalanGun === 0
                ? "Bugün 🎂"
                : `${p.DogumGunuKalanGun} gün kaldı`
              : "—"
          }
          sub={p?.DogumTarihi ? gunAy(p.DogumTarihi) : null}
          href="/ozluk"
        />
      </KartGrid>

      <BolumBaslik title="Maaş & Ödemeler" />
      <StatKart
        wide
        icon={Receipt}
        color="#0EA5E9"
        title={maas ? `Son Bordro · ${getAyAdi(Number(maas.Ay))} ${maas.Yil}` : "Son Bordro"}
        loading={loading}
        value={maas ? (maasGizli ? "•••••• ₺" : tl(maas.NetOdenen)) : "Hesaplanmış bordro yok"}
        sub={
          maas
            ? `Net ödenen${maasGizli ? "" : ` · Ödenecek ${tl(maas.OdenecekTutar)}`} · ${
                maas.Onayli ? "Onaylı" : "Onay bekliyor"
              }`
            : null
        }
        href="/bordro"
        right={
          maas ? (
            <Pressable
              onPress={toggleMaas}
              hitSlop={10}
              accessibilityLabel={maasGizli ? "Maaşı göster" : "Maaşı gizle"}
              className={cn("h-7 w-7 items-center justify-center rounded-full bg-slate-100")}
            >
              {maasGizli ? <Eye size={14} color="#64748B" /> : <EyeOff size={14} color="#64748B" />}
            </Pressable>
          ) : null
        }
      />
      <KartGrid>
        <StatKart
          icon={HandCoins}
          color="#F59E0B"
          title="Avans (bu yıl)"
          loading={loading}
          value={avans ? tl(avans.ToplamTutar) : "—"}
          sub={
            avans
              ? avans.AylikKesinti > 0
                ? `${avans.Adet} avans · Aylık kesinti ${tl(avans.AylikKesinti)}`
                : `${avans.Adet} avans`
              : null
          }
          href="/avanslar"
        />
        <StatKart
          icon={CalendarDays}
          color="#8B5CF6"
          title={puantaj ? `Puantaj · ${getAyAdi(Number(puantaj.Ay))}` : "Puantaj"}
          loading={loading}
          value={puantaj ? `${puantaj.CalisilanGun} gün` : "Kayıt yok"}
          sub={
            puantaj
              ? `${puantaj.CalisilanSaat} saat${puantaj.FazlaMesai ? ` · FM ${puantaj.FazlaMesai}` : ""}`
              : null
          }
          href="/puantaj"
        />
        <StatKart
          icon={PlusCircle}
          color="#10B981"
          title="Eklentiler (bu yıl)"
          loading={loading}
          value={ek ? tl(ek.EklentiToplam) : "—"}
          href="/eklentiler"
        />
        <StatKart
          icon={MinusCircle}
          color="#EF4444"
          title="Kesintiler (bu yıl)"
          loading={loading}
          value={ek ? tl(ek.KesintiToplam) : "—"}
          href="/kesintiler"
        />
      </KartGrid>
    </View>
  );
}
