import { Text } from "@/components/ui/text";
import { useDeleteLokasyon } from "@/hooks/use-lokasyonlar";
import { ApiClientError } from "@/lib/axios";
import type { Lokasyon } from "@/types/lokasyon";
import { useRouter } from "expo-router";
import { MapPin, Pencil, Trash2 } from "lucide-react-native";
import { Alert, Pressable, View } from "react-native";

export function LokasyonListItem({ item }: { item: Lokasyon }) {
  const router = useRouter();
  const deleteLokasyon = useDeleteLokasyon();

  const handleDelete = () => {
    Alert.alert(
      "Lokasyonu Sil",
      `"${item.LokasyonAdi}" lokasyonunu silmek istediğine emin misin?`,
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: () => {
            deleteLokasyon.mutate(item.IDBolumLokasyon, {
              onError: (error) => {
                const message =
                  error instanceof ApiClientError
                    ? error.message
                    : "Lokasyon silinirken bir hata oluştu.";
                Alert.alert("Hata", message);
              },
            });
          },
        },
      ],
    );
  };

  const handleEdit = () => {
    router.push({
      pathname: "/location/save",
      params: { idBolumLokasyon: item.IDBolumLokasyon },
    });
  };

  return (
    <View className="flex-row items-center gap-3 rounded-xl border border-gray-100 bg-white p-3">
      <View className="rounded-full bg-qrz-navy/10 p-2">
        <MapPin size={18} className="text-qrz-navy" />
      </View>

      <View className="flex-1 gap-1">
        <Text className="font-medium text-qrz-navy" numberOfLines={1}>
          {item.LokasyonAdi}
        </Text>
        <Text className="text-xs text-muted-foreground">
          {item.Enlem}, {item.Boylam}
        </Text>
      </View>

      <View
        className={
          item.Aktif ? "rounded-full bg-green-100 px-2 py-1" : "rounded-full bg-gray-100 px-2 py-1"
        }
      >
        <Text className={item.Aktif ? "text-xs text-green-700" : "text-xs text-gray-500"}>
          {item.Aktif ? "Aktif" : "Pasif"}
        </Text>
      </View>

      <Pressable onPress={handleEdit} hitSlop={8} className="p-1">
        <Pencil size={18} className="text-muted-foreground" />
      </Pressable>

      <Pressable onPress={handleDelete} hitSlop={8} className="p-1" disabled={deleteLokasyon.isPending}>
        <Trash2 size={18} color={deleteLokasyon.isPending ? "#ccc" : "#ef4444"} />
      </Pressable>
    </View>
  );
}