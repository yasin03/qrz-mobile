import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { ChevronRight, Info, Search } from "lucide-react-native";

import { Input } from "@/components/ui/input";
import { PuantajDonemBar } from "@/components/puantaj/PuantajDonemBar";
import type { Donem } from "@/components/puantaj/PuantajDonemSecici";
import { useBordroList } from "@/hooks/use-bordro";
import { formatMoney } from "@/lib/format-helpers";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import type { BordroResponseType } from "@/types/bordro";

type Durum = { label: string; bg: string; text: string };

function getDurum(b: BordroResponseType): Durum {
  if (b.OnayTarihi) return { label: "Onaylı", bg: "bg-green-50", text: "text-green-700" };
  if (b.HesaplamaTarihi) return { label: "Onay bekliyor", bg: "bg-amber-50", text: "text-amber-700" };
  return { label: "Hesaplanmadı", bg: "bg-slate-100", text: "text-slate-500" };
}

function basHarfler(b: BordroResponseType) {
  const ad = String(b.Ad ?? "").trim()[0] ?? "";
  const soyad = String(b.Soyad ?? "").trim()[0] ?? "";
  return (ad + soyad).toLocaleUpperCase("tr-TR") || "?";
}

// Admin / yönetici: seçilen ayın bordro listesi (salt okunur). Dokununca personel detayı açılır.
export function BordroYonetimListesi() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [donem, setDonem] = useState<Donem>(() => {
    const now = new Date();
    return { yil: now.getFullYear(), ay: now.getMonth() + 1 };
  });
  const [arama, setArama] = useState("");

  const { data = [], isLoading, isRefetching, refetch } = useBordroList({
    IDSube: user?.IDSube ?? "0",
    IDBolum: "0",
    Yil: String(donem.yil),
    Ay: String(donem.ay).padStart(2, "0"),
    Adi: "",
    TcKimlikNo: "",
  });

  const liste = useMemo(() => {
    const q = arama.trim().toLocaleLowerCase("tr-TR");
    const filtreli = q
      ? data.filter((b) =>
          [b.AdSoyad, b.Ad, b.Soyad, b.SicilNo, b.TcKimlikNo, b.BolumAdi].some((v) =>
            String(v ?? "").toLocaleLowerCase("tr-TR").includes(q),
          ),
        )
      : data;
    return [...filtreli].sort((a, b) =>
      String(a.AdSoyad ?? "").localeCompare(String(b.AdSoyad ?? ""), "tr-TR"),
    );
  }, [data, arama]);

  const ozet = useMemo(
    () => ({
      toplam: liste.reduce((sum, b) => sum + (Number(b.OdenecekTutar) || 0), 0),
      onayli: liste.filter((b) => b.OnayTarihi).length,
      bekleyen: liste.filter((b) => !b.OnayTarihi && b.HesaplamaTarihi).length,
    }),
    [liste],
  );

  const handlePress = useCallback(
    (b: BordroResponseType) =>
      router.push({
        pathname: "/bordro/[id]",
        params: { id: String(b.IDSubePersonel), yil: String(donem.yil), ay: String(donem.ay) },
      } as Href),
    [router, donem],
  );

  return (
    <FlatList
      data={isLoading ? [] : liste}
      keyExtractor={(item) => String(item.IDSubePersonel)}
      contentContainerClassName="p-4"
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      ItemSeparatorComponent={() => <View className="h-2" />}
      ListHeaderComponent={
        <View className="gap-3 pb-3">
          <PuantajDonemBar donem={donem} onChange={setDonem} />

          <View className="rounded-2xl bg-qrz-light p-4">
            <Text className="text-xs font-medium text-slate-500">Toplam ödenecek</Text>
            <Text className="mt-1 text-2xl font-bold text-qrz-navy">{formatMoney(ozet.toplam)} ₺</Text>
            <Text className="mt-1 text-xs text-slate-500">
              {liste.length} personel · {ozet.onayli} onaylı · {ozet.bekleyen} onay bekliyor
            </Text>
          </View>

          <Input
            value={arama}
            onChangeText={setArama}
            placeholder="Ad, sicil no veya TC ile ara"
            startIcon={<Search size={16} color="#64748B" />}
            containerClassName="h-11 rounded-xl border-slate-200 bg-white"
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
        </View>
      }
      ListEmptyComponent={
        isLoading ? (
          <View className="h-48 items-center justify-center">
            <ActivityIndicator color="#052346" />
          </View>
        ) : (
          <View className="h-48 items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-white">
            <Info size={24} color="#94A3B8" />
            <Text className="text-sm text-slate-500">
              {arama ? "Aramaya uygun personel bulunamadı." : "Bu dönem için bordro bulunamadı."}
            </Text>
          </View>
        )
      }
      renderItem={({ item }) => {
        const durum = getDurum(item);
        return (
          <Pressable
            onPress={() => handlePress(item)}
            className="flex-row items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 active:bg-slate-50"
          >
            <View className="h-10 w-10 items-center justify-center rounded-full bg-qrz-light">
              <Text className="text-sm font-bold text-qrz-navy">{basHarfler(item)}</Text>
            </View>

            <View className="flex-1 gap-0.5">
              <Text className="text-sm font-semibold text-qrz-navy" numberOfLines={1}>
                {item.AdSoyad}
              </Text>
              <Text className="text-xs text-slate-500" numberOfLines={1}>
                {[item.BolumAdi, item.UnvanAdi].filter(Boolean).join(" · ")}
              </Text>
              <View className={cn("mt-0.5 self-start rounded-md px-1.5 py-0.5", durum.bg)}>
                <Text className={cn("text-[10px] font-semibold", durum.text)}>{durum.label}</Text>
              </View>
            </View>

            <View className="items-end">
              <Text className="text-sm font-bold text-qrz-navy">
                {formatMoney(item.OdenecekTutar)} ₺
              </Text>
              <Text className="text-[10px] text-slate-400">Ödenecek</Text>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </Pressable>
        );
      }}
    />
  );
}
