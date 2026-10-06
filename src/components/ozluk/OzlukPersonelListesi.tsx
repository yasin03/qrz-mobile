import { useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { ChevronRight, Search, UserSearch, Users } from "lucide-react-native";

import { Input } from "@/components/ui/input";
import { useAktifPersonelListesi } from "@/hooks/use-personel";
import { useAuthStore } from "@/stores/auth-store";
import { initials } from "./ozluk-helpers";

// Admin / yönetici: özlük bilgisi görüntülenecek personeli seçme listesi
export function OzlukPersonelListesi() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [arama, setArama] = useState("");

  const { data = [], isLoading, isRefetching, refetch } = useAktifPersonelListesi(user?.IDSube);

  const liste = useMemo(() => {
    const q = arama.trim().toLocaleLowerCase("tr-TR");
    const filtreli = q
      ? data.filter((p) =>
          [p.AdSoyad, p.SicilNo, p.BolumAdi].some((v) =>
            String(v ?? "").toLocaleLowerCase("tr-TR").includes(q),
          ),
        )
      : data;
    return [...filtreli].sort((a, b) =>
      String(a.AdSoyad ?? "").localeCompare(String(b.AdSoyad ?? ""), "tr-TR"),
    );
  }, [data, arama]);

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
          <Input
            value={arama}
            onChangeText={setArama}
            placeholder="İsim veya sicil no ile ara..."
            startIcon={<Search size={16} color="#64748B" />}
            containerClassName="h-11 rounded-xl border-slate-200 bg-white"
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
          <View className="flex-row items-center gap-1.5">
            <Users size={14} color="#64748B" />
            <Text className="text-xs font-medium text-slate-500">{liste.length} personel</Text>
          </View>
        </View>
      }
      ListEmptyComponent={
        isLoading ? (
          <View className="h-48 items-center justify-center">
            <ActivityIndicator color="#052346" />
          </View>
        ) : (
          <View className="h-48 items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-white">
            <UserSearch size={28} color="#94A3B8" />
            <Text className="text-sm text-slate-500">Personel bulunamadı.</Text>
          </View>
        )
      }
      renderItem={({ item }) => {
        const [ad, ...soyad] = String(item.AdSoyad ?? "").trim().split(" ");
        return (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/ozluk/[id]",
                params: { id: String(item.IDSubePersonel) },
              } as Href)
            }
            className="flex-row items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 active:bg-slate-50"
          >
            <View className="h-10 w-10 items-center justify-center rounded-full bg-qrz-light">
              <Text className="text-sm font-bold text-qrz-navy">
                {initials(ad, soyad.at(-1)) || "?"}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-qrz-navy" numberOfLines={1}>
                {item.AdSoyad}
              </Text>
              <Text className="text-xs text-slate-500" numberOfLines={1}>
                {[item.SicilNo ? `Sicil: ${item.SicilNo}` : null, item.BolumAdi]
                  .filter(Boolean)
                  .join(" · ")}
              </Text>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </Pressable>
        );
      }}
    />
  );
}
