import { useMemo, useState } from "react";
import { View, Text, Pressable, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeDatePicker } from "@/components/native-date-picker";
import { CalendarDays, SlidersHorizontal, X } from "lucide-react-native";

import { useAuthStore } from "@/stores/auth-store";
import { usePdksSelect } from "@/hooks/use-pdks";
import {
  CustomDataTable,
  DataTableColumn,
} from "@/components/custom-data-table";
import { PDKSSelectResponseType } from "@/types/pdks";

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatDisplayDate = (date: Date) => {
  return date.toLocaleDateString("tr-TR");
};

const getMonthStart = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

const getMonthEnd = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0);
};

const Index = () => {
  const user = useAuthStore((state) => state.user);

  const [startDate, setStartDate] = useState(getMonthStart);
  const [endDate, setEndDate] = useState(getMonthEnd);

  const [tempStartDate, setTempStartDate] = useState(getMonthStart);
  const [tempEndDate, setTempEndDate] = useState(getMonthEnd);

  const [filterVisible, setFilterVisible] = useState(false);

  const {
    data: pdksData = [],
    isLoading: isPdksLoading,
    isError: isPdksError,
  } = usePdksSelect(
    Number(user?.IDSubePersonel),
    formatDate(startDate),
    formatDate(endDate),
  );

  const columns: DataTableColumn<PDKSSelectResponseType>[] = [
    {
      key: "Tarih",
      label: "Tarih",
      flex: 1.2,
      render: (item) => (
        <Text className="text-sm font-medium text-gray-800">{item.Tarih}</Text>
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
  ];

  const openFilter = () => {
    setTempStartDate(startDate);
    setTempEndDate(endDate);
    setFilterVisible(true);
  };

  const applyFilter = () => {
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setFilterVisible(false);
  };

  const cancelFilter = () => {
    setTempStartDate(startDate);
    setTempEndDate(endDate);
    setFilterVisible(false);
  };

  const onStartDateChange = (date: Date) => {
    setTempStartDate(date);
  };

  const onEndDateChange = (date: Date) => {
    setTempEndDate(date);
  };

  return (
    <SafeAreaView className="flex-1 p-2">
      {/* Header */}
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-lg font-medium text-qrz-navy">
          PDKS Kayıtları
        </Text>

        <Pressable onPress={openFilter} className=" px-3">
          <SlidersHorizontal size={24} />
        </Pressable>
      </View>

      {/* Selected date range */}
      <View className="mb-3 flex-row items-center gap-2">
        <CalendarDays size={15} color="#64748b" />

        <Text className="text-xs text-gray-500">
          {formatDisplayDate(startDate)} - {formatDisplayDate(endDate)}
        </Text>
      </View>

      {isPdksLoading ? (
        <View className="flex-1 items-center justify-center">
          <Text>PDKS yükleniyor...</Text>
        </View>
      ) : isPdksError ? (
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-red-500">
            PDKS yüklenirken bir hata oluştu.
          </Text>
        </View>
      ) : (
        <View className="flex-1">
          <CustomDataTable
            columns={columns}
            data={pdksData}
            keyExtractor={(item) => String(item.IDSubePersonelSaat)}
            renderDetail={(item) => (
              <View className="gap-2 px-4">
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-500">Normal Süre</Text>

                  <Text className="text-sm font-medium text-gray-800">
                    {item.NormalSure || "-"}
                  </Text>
                </View>

                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-500">Mesai</Text>

                  <Text className="text-sm font-medium text-gray-800">
                    {item.MesaiSure || "-"}
                  </Text>
                </View>

                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-500">İzin</Text>

                  <Text className="text-sm font-medium text-gray-800">
                    {item.IzinSure || "-"}
                  </Text>
                </View>

                {item.Aciklama && (
                  <View className="mt-1">
                    <Text className="text-xs text-gray-400">Açıklama</Text>

                    <Text className="mt-1 text-sm text-gray-700">
                      {item.Aciklama}
                    </Text>
                  </View>
                )}
              </View>
            )}
          />
        </View>
      )}

      {/* Filter Modal */}
      <Modal
        visible={filterVisible}
        transparent
        animationType="slide"
        onRequestClose={cancelFilter}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="rounded-t-3xl bg-white px-5 pb-8 pt-5">
            {/* Modal Header */}
            <View className="mb-6 flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-qrz-navy">
                Tarih Filtresi
              </Text>

              <Pressable
                onPress={cancelFilter}
                className="rounded-full bg-gray-100 p-2"
              >
                <X size={18} color="#64748b" />
              </Pressable>
            </View>

            <View className="flex-row gap-2 mb-4">
              <View className="flex-1">
                <Text className="mb-1 text-xs text-gray-500">Başlangıç</Text>
                <NativeDatePicker
  value={tempStartDate}
  onChange={onStartDateChange}
/>
              </View>

              <View className="flex-1">
                <Text className="mb-1 text-xs text-gray-500">Bitiş</Text>
                <NativeDatePicker
  value={tempEndDate}
  onChange={onEndDateChange}
/>
              </View>
            </View>

            {/* Buttons */}
            <View className="flex-row gap-3">
              <Pressable
                onPress={cancelFilter}
                className="flex-1 items-center rounded-xl border border-gray-200 py-3"
              >
                <Text className="font-medium text-gray-600">Vazgeç</Text>
              </Pressable>

              <Pressable
                onPress={applyFilter}
                className="flex-1 items-center rounded-xl bg-qrz-navy py-3"
              >
                <Text className="font-medium text-white">Uygula</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Index;
