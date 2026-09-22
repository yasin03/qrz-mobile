import { useMemo, useState } from "react";
import { AvansFilterSheet } from "./filtre";
import { getDefaultIzinTarihAraligi } from "@/lib/date-helpers";
import { User } from "@/types/auth";
import { useAvanslar, useDeleteAvans } from "@/hooks/use-avans";
import type { AvansKaydi, AvansTalepKaydi } from "@/types/avans";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { SlidersHorizontal, Trash2 } from "lucide-react-native";
import { CustomDataTable } from "../custom-data-table";

type AvansListesiProps = {
  user: User | null;
};

export default function AvansListesi({ user }: AvansListesiProps) {
  const defaults = useMemo(getDefaultIzinTarihAraligi, []);
  const [baslangic, setBaslangic] = useState<string>(defaults.BaslangicTarihi);
  const [bitis, setBitis] = useState<string>(defaults.BitisTarihi);
  const [filterOpen, setFilterOpen] = useState(false);

  const filtre = {
    IDSube: user?.IDSube ?? "0",
    BaslangicTarihi: baslangic,
    BitisTarihi: bitis,
  };

  const { data, isLoading, isRefetching, refetch } = useAvanslar(filtre);
  const deleteAvansMutation = useDeleteAvans();

  const handleDelete = async (item: AvansKaydi) => {
    const ok = confirm(
      `${item.Ad} ${item.Soyad} - ${item.Tutar} TL tutarındaki avans silinsin mi?`,
    );
    if (ok) deleteAvansMutation.mutate(item.IDIzinGenel);
  };

  const columns = [
    {
      key: "ad",
      label: "Personel",
      flex: 2,
      render: (item: AvansKaydi) => (
        <Text className="text-xs text-gray-700" numberOfLines={1}>
          {item.Ad} {item.Soyad}
        </Text>
      ),
    },
    {
      key: "tutar",
      label: "Tutar",
      flex: 1,
      render: (item: AvansKaydi) => (
        <Text className="text-xs text-gray-700">{item.Tutar} TL</Text>
      ),
    },
    {
      key: "tarih",
      label: "Ödeme",
      flex: 1,
      render: (item: AvansKaydi) => (
        <Text className="text-xs text-gray-700">
          {format(new Date(item.OdemeBaslangicTarihi), "dd.MM.yyyy")}
        </Text>
      ),
    },
  ];

  const renderDetail = (item: AvansKaydi) => (
    <View className="gap-1">
      <Text className="text-xs text-gray-600">
        Bölüm: <Text className="text-gray-800">{item.BolumAdi}</Text>
      </Text>
      <Text className="text-xs text-gray-600">
        Sicil No: <Text className="text-gray-800">{item.SicilNo}</Text>
      </Text>
      <Text className="text-xs text-gray-600">
        Taksit Sayısı:{" "}
        <Text className="text-gray-800">{item.TaksitSayisi}</Text>
      </Text>
      <Text className="text-xs text-gray-600">
        Bordro Kesinti Tutarı:{" "}
        <Text className="text-gray-800">{item.BordroKesintiTutari} TL</Text>
      </Text>
      <Text className="text-xs text-gray-600">
        Mesaj: <Text className="text-gray-800">{item.Mesaj}</Text>
      </Text>
    </View>
  );

  const filtreOzet = `${format(new Date(baslangic), "d MMM", { locale: tr })} - ${format(new Date(bitis), "d MMM yyyy", { locale: tr })}`;

  return (
    <View className="flex-1">
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
          <CustomDataTable
            columns={columns}
            data={data ?? []}
            keyExtractor={(item: AvansKaydi) => item.IDIzinGenel}
            renderAction={(item: AvansKaydi) => (
              <Pressable onPress={() => handleDelete(item)} hitSlop={10}>
                <Trash2 size={18} color="#dc2626" />
              </Pressable>
            )}
            renderDetail={renderDetail}
            refreshing={isRefetching}
            onRefresh={refetch}
          />
        )}
      </View>

      <AvansFilterSheet
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        baslangic={baslangic}
        bitis={bitis}
        onBaslangicChange={setBaslangic}
        onBitisChange={setBitis}
        onTemizle={() => {
          setBaslangic(defaults.BaslangicTarihi);
          setBitis(defaults.BitisTarihi);
        }}
      />
    </View>
  );
}
