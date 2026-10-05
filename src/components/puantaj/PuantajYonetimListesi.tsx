import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { useRouter, type Href } from "expo-router";
import { Info, Search, Users } from "lucide-react-native";

import { Input } from "@/components/ui/input";
import { usePuantajList } from "@/hooks/use-puantaj";
import { useAuthStore } from "@/stores/auth-store";
import type { PuantajSelectResponseType } from "@/types/puantaj";
import { PuantajDonemBar } from "./PuantajDonemBar";
import type { Donem } from "./PuantajDonemSecici";
import { PersonelPuantajKarti } from "./PersonelPuantajKarti";

const SERIT_LEJANT = [
  { label: "Çalışma", className: "bg-emerald-400" },
  { label: "Hafta T.", className: "bg-red-400" },
  { label: "Genel T.", className: "bg-violet-400" },
  { label: "İzin", className: "bg-blue-400" },
  { label: "Rapor", className: "bg-orange-400" },
  { label: "Devamsız", className: "bg-rose-600" },
];

// Yönetici / admin: şubedeki personellerin aylık puantaj listesi (salt okunur)
export function PuantajYonetimListesi() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [donem, setDonem] = useState<Donem>(() => {
    const now = new Date();
    return { yil: now.getFullYear(), ay: now.getMonth() + 1 };
  });
  const [arama, setArama] = useState("");

  const { data = [], isLoading, isRefetching, refetch } = usePuantajList({
    IDSube: user?.IDSube ?? "0",
    IDBolum: "0",
    Yil: String(donem.yil),
    Ay: String(donem.ay).padStart(2, "0"),
    Adi: "",
    TcKimlikNo: "",
  });

  const gunSayisi = new Date(donem.yil, donem.ay, 0).getDate();

  const liste = useMemo(() => {
    const q = arama.trim().toLocaleLowerCase("tr-TR");
    const filtreli = q
      ? data.filter((p) =>
          [p.AdSoyad, p.Ad, p.Soyad, p.SicilNo, p.TcKimlikNo, p.BolumAdi].some(
            (alan) => alan?.toLocaleLowerCase("tr-TR").includes(q),
          ),
        )
      : data;
    return [...filtreli].sort((a, b) =>
      (a.AdSoyad ?? "").localeCompare(b.AdSoyad ?? "", "tr-TR"),
    );
  }, [data, arama]);

  const handlePress = useCallback(
    (kayit: PuantajSelectResponseType) => {
      router.push({
        pathname: "/puantaj/[id]",
        params: {
          id: kayit.IDSubePersonel,
          yil: String(donem.yil),
          ay: String(donem.ay),
        },
      } as Href);
    },
    [router, donem],
  );

  const header = (
    <View className="gap-3 pb-3">
      <PuantajDonemBar donem={donem} onChange={setDonem} />

      <Input
        value={arama}
        onChangeText={setArama}
        placeholder="Ad, sicil no veya TC ile ara"
        startIcon={<Search size={16} color="#64748B" />}
        containerClassName="h-11 rounded-xl border-slate-200 bg-white"
        autoCorrect={false}
        clearButtonMode="while-editing"
      />

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-1.5">
          <Users size={14} color="#64748B" />
          <Text className="text-xs font-medium text-slate-500">
            {liste.length} personel
          </Text>
        </View>
        <View className="flex-row flex-wrap justify-end gap-x-2 gap-y-1">
          {SERIT_LEJANT.map((item) => (
            <View key={item.label} className="flex-row items-center gap-1">
              <View className={`h-2 w-2 rounded-sm ${item.className}`} />
              <Text className="text-[10px] text-slate-500">{item.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <FlatList
      data={isLoading ? [] : liste}
      keyExtractor={(item) => item.IDSubePersonel}
      renderItem={({ item }) => (
        <PersonelPuantajKarti
          kayit={item}
          gunSayisi={gunSayisi}
          onPress={handlePress}
        />
      )}
      ListHeaderComponent={header}
      ItemSeparatorComponent={() => <View className="h-2" />}
      ListEmptyComponent={
        isLoading ? (
          <View className="h-64 items-center justify-center">
            <ActivityIndicator color="#052346" />
          </View>
        ) : (
          <View className="h-64 items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-white">
            <Info size={24} color="#94A3B8" />
            <Text className="text-sm text-slate-500">
              {arama
                ? "Aramaya uygun personel bulunamadı."
                : "Bu ay için puantaj kaydı bulunamadı."}
            </Text>
          </View>
        )
      }
      contentContainerClassName="p-4"
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
    />
  );
}
