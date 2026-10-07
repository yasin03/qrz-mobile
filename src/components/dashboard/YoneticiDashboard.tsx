import { Text, View } from "react-native";
import { format, parseISO } from "date-fns";
import { tr } from "date-fns/locale";
import {
  Hourglass,
  Plane,
  Receipt,
  UserCheck,
  Users,
} from "lucide-react-native";

import { getAyAdi } from "@/components/puantaj/puantaj-helpers";
import { formatMoney } from "@/lib/format-helpers";
import type { YoneticiDashboard as YoneticiDashboardData } from "@/types/dashboard";
import { BolumBaslik, KartGrid, ListeSatiri, StatKart } from "./DashboardKart";

const gunAy = (ymd: string) => format(parseISO(ymd), "d MMMM", { locale: tr });

type Props = {
  data: YoneticiDashboardData | undefined;
  loading: boolean;
};

export function YoneticiDashboard({ data, loading }: Props) {
  const pdks = data?.pdksBugun;
  const izinde = data?.bugunIzinde;
  const talepler = data?.bekleyenTalepler;
  const bordro = data?.bordro;
  const dogumGunleri = data?.dogumGunleri;

  return (
    <View className="px-4">
      <BolumBaslik title="Bugün" />
      <KartGrid>
        <StatKart
          icon={Users}
          color="#052346"
          title="Aktif Personel"
          loading={loading}
          value={data?.personelSayisi != null ? String(data.personelSayisi) : "—"}
          href="/ozluk"
        />
        <StatKart
          icon={UserCheck}
          color="#059669"
          title="Bugün Gelen"
          loading={loading}
          value={pdks ? String(pdks.Gelen) : "—"}
          sub={pdks?.Gelmeyen != null ? `${pdks.Gelmeyen} kişi gelmedi` : null}
          href="/pdks"
        />
        <StatKart
          icon={Plane}
          color="#2563EB"
          title="Bugün İzinde"
          loading={loading}
          value={izinde ? String(izinde.Sayi) : "—"}
          href="/izinler"
        />
        <StatKart
          icon={Hourglass}
          color="#D97706"
          title="Onay Bekleyen"
          loading={loading}
          value={talepler ? String(talepler.Izin + talepler.Avans) : "—"}
          sub={talepler ? `${talepler.Izin} izin · ${talepler.Avans} avans` : null}
          href={talepler && talepler.Izin === 0 && talepler.Avans > 0 ? "/avanslar" : "/izinler"}
        />
      </KartGrid>

      <BolumBaslik title="Bordro" />
      <StatKart
        wide
        icon={Receipt}
        color="#0EA5E9"
        title={bordro ? `${getAyAdi(Number(bordro.Ay))} ${bordro.Yil} · Toplam ödenecek` : "Bordro"}
        loading={loading}
        value={bordro ? `${formatMoney(bordro.ToplamOdenecek)} ₺` : "—"}
        sub={
          bordro
            ? `${bordro.Toplam} personel · ${bordro.Hesaplanan} hesaplandı · ${bordro.Onayli} onaylı · ${bordro.OnayBekleyen} onay bekliyor`
            : null
        }
        href="/bordro"
      />

      {izinde && izinde.Liste.length > 0 && (
        <>
          <BolumBaslik title="Bugün İzinde Olanlar" />
          <View className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
            {izinde.Liste.slice(0, 5).map((i, idx, arr) => (
              <ListeSatiri
                key={`${i.IDSubePersonel}-${idx}`}
                title={i.AdSoyad}
                sub={i.Tip}
                right={`${gunAy(i.BitisTarihi)}'e kadar`}
                isLast={idx === arr.length - 1}
              />
            ))}
          </View>
        </>
      )}

      {dogumGunleri && dogumGunleri.length > 0 && (
        <>
          <BolumBaslik title="Yaklaşan Doğum Günleri" />
          <View className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
            {dogumGunleri.slice(0, 5).map((d, idx, arr) => (
              <ListeSatiri
                key={d.IDSubePersonel}
                title={d.AdSoyad}
                sub={gunAy(d.Tarih)}
                right={d.KalanGun === 0 ? "Bugün 🎂" : `${d.KalanGun} gün`}
                href={{ pathname: "/ozluk/[id]", params: { id: d.IDSubePersonel } }}
                isLast={idx === arr.length - 1}
              />
            ))}
          </View>
        </>
      )}

      {!loading && !data && (
        <Text className="mt-6 text-center text-sm text-slate-500">
          Özet bilgileri yüklenemedi. Aşağı çekerek yenileyin.
        </Text>
      )}
    </View>
  );
}
