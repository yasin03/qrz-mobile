import { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { ChevronRight } from "lucide-react-native";
import type { PuantajSelectResponseType } from "@/types/puantaj";
import { cn } from "@/lib/utils";
import { getPuantajBadge } from "./puantaj-helpers";

type Props = {
  kayit: PuantajSelectResponseType;
  gunSayisi: number;
  onPress: (kayit: PuantajSelectResponseType) => void;
};

function sayi(value: string | null | undefined) {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function basHarfler(kayit: PuantajSelectResponseType) {
  const ad = kayit.Ad?.trim()?.[0] ?? "";
  const soyad = kayit.Soyad?.trim()?.[0] ?? "";
  return (ad + soyad).toLocaleUpperCase("tr-TR") || "?";
}

// Yönetici listesindeki personel kartı: ad, özet sayılar ve ayın günlerini
// gösteren renkli mini şerit. Dokununca personelin takvim detayına gider.
function PersonelPuantajKartiImpl({ kayit, gunSayisi, onPress }: Props) {
  const izin =
    sayi(kayit.ToplamYI) + sayi(kayit.ToplamMI);

  const ozetler = [
    { label: "Gün", value: sayi(kayit.ToplamGun) },
    { label: "Saat", value: sayi(kayit.ToplamSaat) },
    { label: "İzin", value: izin },
    { label: "HT", value: sayi(kayit.ToplamHT) },
  ];

  return (
    <Pressable
      onPress={() => onPress(kayit)}
      className="rounded-2xl border border-slate-100 bg-white p-3 active:bg-slate-50"
    >
      <View className="flex-row items-center gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-qrz-light">
          <Text className="text-sm font-bold text-qrz-navy">
            {basHarfler(kayit)}
          </Text>
        </View>

        <View className="flex-1">
          <Text className="text-sm font-semibold text-qrz-navy" numberOfLines={1}>
            {kayit.AdSoyad || `${kayit.Ad} ${kayit.Soyad}`}
          </Text>
          <Text className="text-xs text-slate-500" numberOfLines={1}>
            {[kayit.BolumAdi, kayit.UnvanAdi].filter(Boolean).join(" · ")}
          </Text>
        </View>

        <ChevronRight size={18} color="#94A3B8" />
      </View>

      <View className="mt-3 flex-row gap-[2px]">
        {Array.from({ length: gunSayisi }, (_, i) => {
          const badge = getPuantajBadge(kayit[`G${i + 1}`]);
          return (
            <View
              key={i}
              className={cn(
                "h-2 flex-1 rounded-sm",
                badge ? badge.dotClassName : "bg-slate-100",
              )}
            />
          );
        })}
      </View>

      <View className="mt-3 flex-row">
        {ozetler.map((item) => (
          <View key={item.label} className="flex-1 items-center">
            <Text
              className={cn(
                "text-sm font-bold",
                item.value ? "text-qrz-navy" : "text-slate-300",
              )}
            >
              {item.value}
            </Text>
            <Text className="text-[10px] text-slate-500">{item.label}</Text>
          </View>
        ))}
      </View>
    </Pressable>
  );
}

export const PersonelPuantajKarti = memo(PersonelPuantajKartiImpl);
