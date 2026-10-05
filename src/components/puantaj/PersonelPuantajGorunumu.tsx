import { useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Info } from "lucide-react-native";

import { usePuantajById } from "@/hooks/use-puantaj";
import { PuantajDonemBar } from "./PuantajDonemBar";
import type { Donem } from "./PuantajDonemSecici";
import { PuantajOzet } from "./PuantajOzet";
import { PuantajTakvimi } from "./PuantajTakvimi";
import { PuantajKodAciklamalari } from "./PuantajKodAciklamalari";

type Props = {
  idSubePersonel: string | null | undefined;
  baslangicDonem?: Donem;
  /** Takvimin üstünde personel adı / unvanı gösterilsin mi (yönetici görünümü) */
  personelBilgisiGoster?: boolean;
};

function buAy(): Donem {
  const now = new Date();
  return { yil: now.getFullYear(), ay: now.getMonth() + 1 };
}

// Tek personelin aylık puantajı: dönem seçici + özet + takvim + kod açıklamaları.
// Personelin kendi ekranı ve yöneticinin personel detayı ortak kullanır.
export function PersonelPuantajGorunumu({
  idSubePersonel,
  baslangicDonem,
  personelBilgisiGoster,
}: Props) {
  const [donem, setDonem] = useState<Donem>(() => baslangicDonem ?? buAy());

  const { data, isLoading, isRefetching, refetch } = usePuantajById(
    {
      IDSubePersonel: idSubePersonel ?? "0",
      Yil: String(donem.yil),
      Ay: String(donem.ay).padStart(2, "0"),
    },
    !!idSubePersonel,
  );

  const kayit = data?.[0];

  return (
    <ScrollView
      contentContainerClassName="gap-4 p-4"
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
    >
      {personelBilgisiGoster && kayit ? (
        <View className="rounded-2xl border border-slate-100 bg-white p-4">
          <Text className="text-base font-bold text-qrz-navy">
            {kayit.AdSoyad || `${kayit.Ad} ${kayit.Soyad}`}
          </Text>
          <Text className="mt-0.5 text-xs text-slate-500">
            {[kayit.UnvanAdi, kayit.SicilNo ? `Sicil: ${kayit.SicilNo}` : null]
              .filter(Boolean)
              .join(" · ")}
          </Text>
        </View>
      ) : null}

      <PuantajDonemBar
        donem={donem}
        onChange={setDonem}
        altBaslik={kayit?.BolumAdi}
      />

      {isLoading ? (
        <View className="h-64 items-center justify-center">
          <ActivityIndicator color="#052346" />
        </View>
      ) : !kayit ? (
        <View className="h-64 items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-white">
          <Info size={24} color="#94A3B8" />
          <Text className="text-sm text-slate-500">
            Bu ay için puantaj kaydı bulunamadı.
          </Text>
        </View>
      ) : (
        <>
          <PuantajOzet kayit={kayit} />
          <PuantajTakvimi kayit={kayit} yil={donem.yil} ay={donem.ay} />
        </>
      )}

      <PuantajKodAciklamalari />
    </ScrollView>
  );
}
