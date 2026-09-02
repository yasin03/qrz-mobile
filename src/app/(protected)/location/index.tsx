import { View, Text, FlatList } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/button";
import { Ad, MapPinOff, MapPinPlus } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useBolumler } from "@/hooks/use-kurumsal";
import { useLokasyonlar } from "@/hooks/use-lokasyonlar";
import { SelectPicker } from "@/components/ui/select-picker";
import { LokasyonListItem } from "@/components/lokasyon/lokasyon-list-item";

const Index = () => {
  const router = useRouter();
  const [selectedBolumId, setSelectedBolumId] = useState<string>();

  

  const {
    data: bolumler,
    isLoading: isBolumlerLoading,
    isError: isBolumlerError,
  } = useBolumler();

  const {
    data: lokasyonlar,
    isLoading: isLokasyonlarLoading,
    isError: isLokasyonlarError,
  } = useLokasyonlar(selectedBolumId ? Number(selectedBolumId) : undefined);

  return (
    <SafeAreaView className="flex-1">
      <View className="flex-row items-center justify-between px-4 py-2">
        <Text className="text-lg font-medium text-qrz-navy">Lokasyonlar</Text>
        <Button
          variant="secondary"
          onPress={() => router.push("/location/save")}
        >
          <MapPinPlus size={20} />
        </Button>
      </View>

      <View className="px-4 pb-2">
        <SelectPicker
          value={selectedBolumId}
          onChange={setSelectedBolumId}
          options={
            bolumler?.map((b) => ({
              value: String(b.IDBolum),
              label: b.BolumAdi,
            })) ?? []
          }
          placeholder="Bölüm seçiniz"
          title="Bölüm Seçiniz"
          isLoading={isBolumlerLoading}
          disabled={isBolumlerError}
        />
      </View>

      {!selectedBolumId ? (
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-muted-foreground">
            Lokasyonları görmek için bir bölüm seçiniz.
          </Text>
        </View>
      ) : isLokasyonlarLoading ? (
        <View className="flex-1 items-center justify-center">
          <Text>Lokasyonlar yükleniyor...</Text>
        </View>
      ) : isLokasyonlarError ? (
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-red-500">
            Lokasyonlar yüklenirken bir hata oluştu.
          </Text>
        </View>
      ) : (
        <FlatList
          data={lokasyonlar}
          keyExtractor={(item) => item.IDBolumLokasyon}
          contentContainerClassName="gap-2 px-4 pb-4"
          ListEmptyComponent={
            <View className="items-center gap-2 py-12">
              <MapPinOff size={32} className="text-muted-foreground" />
              <Text className="text-muted-foreground">
                Bu bölüme ait lokasyon bulunamadı.
              </Text>
            </View>
          }
          renderItem={({ item }) => <LokasyonListItem item={item} />}
        />
      )}
    </SafeAreaView>
  );
};

export default Index;
