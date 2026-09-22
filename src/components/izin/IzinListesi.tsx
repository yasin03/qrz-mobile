import { useMemo, useState } from "react";
import { getDefaultIzinTarihAraligi } from "@/lib/date-helpers";
import { User } from "@/types/auth";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { SlidersHorizontal, Trash2 } from "lucide-react-native";
import { CustomDataTable } from "../custom-data-table";
import { IzinFilterSheet } from "./filtre";
import { IzinType } from "@/types/izin";
import { useRole } from "@/hooks/use-role";
import { useForm } from "react-hook-form";
import { usePersonelSabitTanimlar } from "@/hooks/use-sabit-tanimlar";
import { useIzinList } from "@/hooks/use-izin";

type FiltreForm = { aciklama: string };
type IzinListesiProps = {
  user: User | null;
};
export default function IzinListesi({ user }: IzinListesiProps) {
  const { isAdmin, isYonetici } = useRole();
  const isYoneticiVeyaAdmin = isAdmin || isYonetici;
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

  const { data, isLoading, isRefetching, refetch } = useIzinList(filtre);

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
      render: (item: IzinType) => (
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
      render: (item: IzinType) => (
        <Text className="text-xs text-gray-700" numberOfLines={1}>
          {item.Aciklama}
        </Text>
      ),
    },
    {
      key: "gun",
      label: "Gün",
      flex: 1,
      render: (item: IzinType) => (
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
      render: (item: IzinType) => (
        <Text className="text-xs text-gray-700" numberOfLines={1}>
          {item.Ad} {item.Soyad}
        </Text>
      ),
    },
    {
      key: "tarih",
      label: "Tarih",
      flex: 2,
      render: (item: IzinType) => (
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
      render: (item: IzinType) => (
        <Text className="text-xs text-gray-700">{item.Gun}</Text>
      ),
    },
  ];

  const columns = isYoneticiVeyaAdmin ? yoneticiColumns : personelColumns;

  const renderDetail = (item: IzinType) => (
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

  const filtreOzet = `${format(new Date(baslangic), "d MMM", { locale: tr })} - ${format(new Date(bitis), "d MMM yyyy", { locale: tr })}${aciklama ? " · " + (izinTipleri?.find((t) => t.value === aciklama)?.label ?? "") : ""}`;
  return (
    <View className="flex-1">
      <Pressable
        onPress={() => setFilterOpen(true)}
        className="flex-row items-center justify-between rounded-lg border border-gray-200 px-3 py-2"
      >
        <Text className="text-xs text-gray-600">{filtreOzet}</Text>
        <SlidersHorizontal size={16} color="#0f172a" />
      </Pressable>

      <View className="mt-4 flex-1">
        {isLoading ? (
          <ActivityIndicator className="mt-8" />
        ) : (
          <CustomDataTable
            columns={columns}
            data={data ?? []}
            keyExtractor={(item) => item.IDIzinGenel}
            renderDetail={renderDetail}
            refreshing={isRefetching}
            onRefresh={refetch}
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
    </View>
  );
}
