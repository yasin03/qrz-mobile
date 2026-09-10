import { useMemo, useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { Plus, Trash2, SlidersHorizontal } from "lucide-react-native";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuthStore } from "@/stores/auth-store";
import { useRole } from "@/hooks/use-role";
import { useIzinler, useDeleteIzin } from "@/hooks/use-izin";
import { usePersonelSabitTanimlar } from "@/hooks/use-sabit-tanimlar";
import { getDefaultIzinTarihAraligi } from "@/lib/date-helpers";
import { confirm } from "@/stores/dialog-store";
import { DataTable } from "@/components/data-table";

import type { IzinKaydi } from "@/types/izin";
import { IzinFilterSheet } from "@/components/izin/filtre";

type FiltreForm = { aciklama: string };

export default function Izinler() {
  const { isAdmin, isYonetici } = useRole();
  const isYoneticiVeyaAdmin = isAdmin || isYonetici;
  const user = useAuthStore((state) => state.user);
  const { izinTipleri } = usePersonelSabitTanimlar();

  const { control, watch, reset } = useForm<FiltreForm>({
    defaultValues: { aciklama: "" },
  });
  const aciklama = watch("aciklama");

  const defaults = useMemo(getDefaultIzinTarihAraligi, []);
  const [baslangic, setBaslangic] = useState(defaults.BaslangicTarihi);
  const [bitis, setBitis] = useState(defaults.BitisTarihi);
  const [filterOpen, setFilterOpen] = useState(false);

  const filtre = {
    IDSube: user?.IDSube ?? "0",
    IDSubePersonel: isYoneticiVeyaAdmin ? "0" : (user?.IDSubePersonel ?? "0"),
    BaslangicTarihi: baslangic,
    BitisTarihi: bitis,
    Aciklama: aciklama,
  };

  const { data, isLoading } = useIzinler(filtre);
  const deleteIzinMutation = useDeleteIzin();

  const handleDelete = async (item: IzinKaydi) => {
    const ok = await confirm({
      title: "İzni sil",
      description: `${item.Ad} ${item.Soyad} - ${format(new Date(item.BaslangicTarihi), "dd.MM.yyyy")} tarihli izin silinsin mi?`,
      variant: "destructive",
      confirmText: "Sil",
    });
    if (ok) deleteIzinMutation.mutate(item.IDIzinGenel);
  };

  const handleTemizle = () => {
    reset({ aciklama: "" });
    setBaslangic(defaults.BaslangicTarihi);
    setBitis(defaults.BitisTarihi);
  };

  // Personel görünümü: kompakt sütunlar
  const personelColumns = [
    {
      key: "tarih",
      label: "Tarih",
      flex: 2,
      render: (item: IzinKaydi) => (
        <Text className="text-xs text-gray-700">
          {format(new Date(item.BaslangicTarihi), "dd.MM")} -{" "}
          {format(new Date(item.BitisTarihi), "dd.MM.yyyy")}
        </Text>
      ),
    },
    {
      key: "aciklama",
      label: "İzin Tipi",
      flex: 2,
      render: (item: IzinKaydi) => (
        <Text className="text-xs text-gray-700" numberOfLines={1}>
          {item.Aciklama}
        </Text>
      ),
    },
    {
      key: "gun",
      label: "Gün",
      flex: 1,
      render: (item: IzinKaydi) => (
        <Text className="text-xs text-gray-700">{item.Gun}</Text>
      ),
    },
  ];

  // Yönetici/admin görünümü: personel adı öne çıkar, detaylar expand'de
  const yoneticiColumns = [
    {
      key: "ad",
      label: "Personel",
      flex: 2,
      render: (item: IzinKaydi) => (
        <Text className="text-xs text-gray-700" numberOfLines={1}>
          {item.Ad} {item.Soyad}
        </Text>
      ),
    },
    {
      key: "tarih",
      label: "Tarih",
      flex: 2,
      render: (item: IzinKaydi) => (
        <Text className="text-xs text-gray-700">
          {format(new Date(item.BaslangicTarihi), "dd.MM")} -{" "}
          {format(new Date(item.BitisTarihi), "dd.MM.yyyy")}
        </Text>
      ),
    },
    {
      key: "gun",
      label: "Gün",
      flex: 1,
      render: (item: IzinKaydi) => (
        <Text className="text-xs text-gray-700">{item.Gun}</Text>
      ),
    },
  ];

  const columns = isYoneticiVeyaAdmin ? yoneticiColumns : personelColumns;

  const renderDetail = (item: IzinKaydi) => (
    <View className="gap-1">
      <Text className="text-xs text-gray-600">
        Bölüm: <Text className="text-gray-800">{item.BolumAdi}</Text>
      </Text>
      <Text className="text-xs text-gray-600">
        Ad Soyad:{" "}
        <Text className="text-gray-800">
          {item.Ad} {item.Soyad}
        </Text>
      </Text>
      <Text className="text-xs text-gray-600">
        Sicil No: <Text className="text-gray-800">{item.SicilNo}</Text>
      </Text>
      <Text className="text-xs text-gray-600">
        İzin Tipi: <Text className="text-gray-800">{item.Aciklama}</Text>
      </Text>
      <Text className="text-xs text-gray-600">
        Gün: <Text className="text-gray-800">{item.Gun}</Text>
      </Text>
    </View>
  );

  const filtreOzet = `${format(new Date(baslangic), "d MMM")} - ${format(new Date(bitis), "d MMM yyyy")}${aciklama ? " · " + (izinTipleri?.find((t) => t.value === aciklama)?.label ?? "") : ""}`;

  return (
    <SafeAreaView className="flex-1 bg-white px-4 pt-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-lg font-medium text-qrz-navy">İzinler</Text>
        <Pressable
          onPress={() => router.push("/izinler/ekle")}
          className="flex-row items-center gap-1 rounded-lg bg-qrz-navy px-3 py-2"
        >
          <Plus size={16} color="white" />
          <Text className="text-xs font-medium text-white">Yeni Talep</Text>
        </Pressable>
      </View>

      <Pressable
        onPress={() => setFilterOpen(true)}
        className="mt-3 flex-row items-center justify-between rounded-lg border border-gray-200 px-3 py-2"
      >
        <Text className="text-xs text-gray-600">{filtreOzet}</Text>
        <SlidersHorizontal size={16} color="#0f172a" />
      </Pressable>

      <View className="mt-4 flex-1">
        {isLoading ? (
          <ActivityIndicator className="mt-8" />
        ) : (
          <DataTable
            columns={columns}
            data={data ?? []}
            keyExtractor={(item) => item.IDIzinGenel}
            renderAction={(item) => (
              <Pressable onPress={() => handleDelete(item)} hitSlop={10}>
                <Trash2 size={18} color="#dc2626" />
              </Pressable>
            )}
            renderDetail={renderDetail}
          />
        )}
      </View>

      <IzinFilterSheet
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        control={control}
        izinTipleri={izinTipleri ?? []}
        baslangic={baslangic}
        bitis={bitis}
        onBaslangicChange={setBaslangic}
        onBitisChange={setBitis}
        onTemizle={handleTemizle}
      />
    </SafeAreaView>
  );
}
