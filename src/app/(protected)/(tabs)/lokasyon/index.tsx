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

// Bölüm filtresinde en üstte duran "Tümü" seçeneği — boş değer, API'ye
// IDBolum gönderilmiyor ve şubenin tüm lokasyonları geliyor.
const TUMU_OPTION = { value: "", label: "Tümü" };

const Index = () => {
  const router = useRouter();
  const [selectedBolumId, setSelectedBolumId] = useState<string>(
    TUMU_OPTION.value,
  );

  const {
    data: bolumler,
    isLoading: isBolumlerLoading,
    isError: isBolumlerError,
  } = useBolumler();

  const {
    data: lokasyonlar,
    isLoading: isLokasyonlarLoading,
    isError: isLokasyonlarError,
  } = useLokasyonlar(selectedBolumId);

  return (
    <SafeAreaView className="flex-1">
      <View className="flex-row items-center justify-between px-4 py-2">
        <Text className="text-lg font-medium text-qrz-navy">Lokasyonlar</Text>
        <Button
          variant="secondary"
          onPress={() => router.push("/lokasyon/save")}
        >
          <MapPinPlus size={20} />
        </Button>
      </View>

      <View className="px-4 pb-2">
        <SelectPicker
          value={selectedBolumId}
          onChange={setSelectedBolumId}
          options={[
            TUMU_OPTION,
            ...(bolumler?.map((b) => ({
              value: String(b.IDBolum),
              label: b.BolumAdi,
            })) ?? []),
          ]}
          placeholder="Bölüm seçiniz"
          title="Bölüm Seçiniz"
          isLoading={isBolumlerLoading}
          disabled={isBolumlerError}
        />
      </View>

      {isLokasyonlarLoading ? (
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
                {selectedBolumId
                  ? "Bu bölüme ait lokasyon bulunamadı."
                  : "Lokasyon bulunamadı."}
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
