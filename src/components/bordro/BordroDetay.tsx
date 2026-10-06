import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Info, SlidersHorizontal, User } from "lucide-react-native";

import { BilgiBolumu } from "@/components/bilgi-bolumu";
import { PuantajDonemBar } from "@/components/puantaj/PuantajDonemBar";
import type { Donem } from "@/components/puantaj/PuantajDonemSecici";
import { getAyAdi } from "@/components/puantaj/puantaj-helpers";
import { useBordroById } from "@/hooks/use-bordro";
import { formatMoney } from "@/lib/format-helpers";
import { cn } from "@/lib/utils";
import {
  formatFieldValue,
  isZero,
  PERSONAL_FIELDS,
  REPORT_GROUPS,
  SUMMARY_FIELDS,
  type BordroValues,
  type Field,
} from "./bordro-fields";
import { BordroFiltreSheet } from "./BordroFiltreSheet";

type Props = {
  idSubePersonel: string | number | null | undefined;
  baslangicDonem?: Donem;
};

function buAy(): Donem {
  const now = new Date();
  return { yil: now.getFullYear(), ay: now.getMonth() + 1 };
}

const toAlanlar = (fields: Field[], values: BordroValues, showZeros: boolean) =>
  fields
    .filter((f) => showZeros || !isZero(values[f.key], f.type))
    .map((f) => ({ label: f.label, value: formatFieldValue(values[f.key], f.type) }));

// Tek personelin aylık bordrosu: dönem seçici + filtre + özet toplamlar + bölümler.
// Personelin kendi ekranı ve yöneticinin personel detayı ortak kullanır.
export function BordroDetay({ idSubePersonel, baslangicDonem }: Props) {
  const [donem, setDonem] = useState<Donem>(() => baslangicDonem ?? buAy());
  const [showPersonal, setShowPersonal] = useState(false);
  const [showZeros, setShowZeros] = useState(false);
  const [filtreOpen, setFiltreOpen] = useState(false);

  const { data, isLoading, isError, isRefetching, refetch } = useBordroById(
    {
      IDSubePersonel: idSubePersonel ?? "0",
      Yil: String(donem.yil),
      Ay: String(donem.ay).padStart(2, "0"),
    },
    !!idSubePersonel,
  );

  // API dizi ya da tek obje dönebilir
  const bordro = ((Array.isArray(data) ? data[0] : data) ?? null) as BordroValues | null;
  const donemAdi = `${getAyAdi(donem.ay)} ${donem.yil}`;
  const filtreAktif = showPersonal || showZeros;

  const gruplar = bordro
    ? REPORT_GROUPS.map((g) => ({ ...g, alanlar: toAlanlar(g.fields, bordro, showZeros) })).filter(
        (g) => g.alanlar.length > 0,
      )
    : [];

  return (
    <>
      <ScrollView
        contentContainerClassName="gap-3 p-4"
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      >
        {/* Personel + filtre */}
        <View className="flex-row items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4">
          <View className="flex-1">
            <Text className="text-base font-bold text-qrz-navy" numberOfLines={1}>
              {String(bordro?.AdSoyad ?? "—").trim()}
            </Text>
            <Text className="text-xs text-slate-500" numberOfLines={1}>
              {[bordro?.SicilNo ? `Sicil No: ${bordro.SicilNo}` : null, bordro?.BolumAdi]
                .filter(Boolean)
                .join(" · ") || donemAdi}
            </Text>
          </View>
          <Pressable
            onPress={() => setFiltreOpen(true)}
            accessibilityLabel="Görünüm filtresi"
            className={cn(
              "h-10 flex-row items-center gap-1.5 rounded-xl border px-3",
              filtreAktif ? "border-qrz-navy bg-qrz-light" : "border-slate-200 bg-white",
            )}
          >
            <SlidersHorizontal size={16} color="#052346" />
            <Text className="text-sm font-medium text-qrz-navy">Filtre</Text>
          </Pressable>
        </View>

        <PuantajDonemBar donem={donem} onChange={setDonem} />

        {isLoading ? (
          <View className="h-48 items-center justify-center">
            <ActivityIndicator color="#052346" />
          </View>
        ) : isError ? (
          <View className="rounded-2xl border border-red-100 bg-red-50 p-4">
            <Text className="text-sm text-red-600">Bordro bilgileri yüklenirken bir hata oluştu.</Text>
          </View>
        ) : !bordro ? (
          <View className="h-48 items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-white">
            <Info size={24} color="#94A3B8" />
            <Text className="text-sm text-slate-500">{donemAdi} dönemi için bordro bulunamadı.</Text>
          </View>
        ) : (
          <>
            {/* Özet toplamlar ("0 değerleri göster" filtresinden bağımsız) */}
            <View className="flex-row flex-wrap justify-between">
              {SUMMARY_FIELDS.map(({ key, label, icon: Icon }) => (
                <View
                  key={key}
                  className="mb-2 w-[49%] gap-1 rounded-2xl border border-qrz-blue/20 bg-qrz-light p-3"
                >
                  <View className="flex-row items-center gap-1.5">
                    <Icon size={13} color="#052346" />
                    <Text className="flex-1 text-[11px] uppercase text-slate-500" numberOfLines={1}>
                      {label}
                    </Text>
                  </View>
                  <Text className="text-base font-bold text-qrz-navy" numberOfLines={1} adjustsFontSizeToFit>
                    {formatMoney(bordro[key] as number | null)} ₺
                  </Text>
                </View>
              ))}
            </View>

            {showPersonal && (
              <BilgiBolumu
                title="Kişisel Bilgiler"
                icon={User}
                fields={toAlanlar(PERSONAL_FIELDS, bordro, true)}
              />
            )}

            {gruplar.map((g) => (
              <BilgiBolumu key={g.key} title={g.title} icon={g.icon} fields={g.alanlar} />
            ))}

            {bordro.HesaplamaTarihi2 ? (
              <Text
                className={cn(
                  "text-right text-xs text-slate-500",
                  !bordro.OnayTarihi && "italic",
                )}
              >
                Hesaplama: {String(bordro.HesaplamaTarihi2)}
                {!bordro.OnayTarihi && " · Onay bekliyor"}
              </Text>
            ) : null}
          </>
        )}
      </ScrollView>

      <BordroFiltreSheet
        visible={filtreOpen}
        onClose={() => setFiltreOpen(false)}
        showPersonal={showPersonal}
        onShowPersonalChange={setShowPersonal}
        showZeros={showZeros}
        onShowZerosChange={setShowZeros}
      />
    </>
  );
}
