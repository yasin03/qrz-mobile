import { useState } from "react";
import { Text, View } from "react-native";

import {
  CustomDataTable,
  DataTableColumn,
} from "@/components/custom-data-table";
import {
  buAy,
  CustomDateNavigator,
  type Donem,
  donemToValue,
  valueToDonem,
} from "@/components/custom-date-navigator";
import { usePdksSelect } from "@/hooks/use-pdks";
import { PDKSSelectResponseType } from "@/types/pdks";
import { PdksDetay } from "./PdksDetay";
import { formatGun } from "./pdks-helpers";

const columns: DataTableColumn<PDKSSelectResponseType>[] = [
  {
    key: "Tarih",
    label: "Tarih",
    flex: 1.2,
    render: (item) => (
      <Text className="text-sm font-medium text-gray-800">
        {formatGun(item.Tarih)}
      </Text>
    ),
  },
  {
    key: "Giris",
    label: "Giriş",
    flex: 1,
    render: (item) => (
      <Text className="text-sm text-gray-600">{item.Giris || "-"}</Text>
    ),
  },
  {
    key: "Cikis",
    label: "Çıkış",
    flex: 1,
    render: (item) => (
      <Text className="text-sm text-gray-600">{item.Cikis || "-"}</Text>
    ),
  },
  {
    key: "ToplamSure",
    label: "Toplam Süre",
    flex: 1,
    render: (item) => (
      <Text className="text-sm text-gray-600">{item.ToplamSure || "-"}</Text>
    ),
  },
];

// Personelin kendi aylık giriş/çıkış kayıtları - satıra basınca detay açılır
export function PersonelPdksListesi() {
  const [donem, setDonem] = useState<Donem>(buAy);

  const {
    data: kayitlar = [],
    isLoading,
    isError,
    isRefetching,
    refetch,
  } = usePdksSelect({
    Yil: String(donem.yil),
    Ay: String(donem.ay).padStart(2, "0"),
  });

  return (
    <View className="flex-1 gap-3">
      <CustomDateNavigator
        mode="month"
        value={donemToValue(donem)}
        onChange={(value) => setDonem(valueToDonem(value))}
      />

      <View className="flex-1">
        <CustomDataTable
          columns={columns}
          data={kayitlar}
          keyExtractor={(item) => String(item.IDSubePersonelSaat)}
          isLoading={isLoading}
          emptyText={
            isError
              ? "PDKS yüklenirken bir hata oluştu."
              : "Bu ay için PDKS kaydı bulunamadı"
          }
          onRetry={refetch}
          refreshing={isRefetching}
          onRefresh={refetch}
          renderDetail={(item) => <PdksDetay kayit={item} />}
        />
      </View>
    </View>
  );
}
