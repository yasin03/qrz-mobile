import { Text } from "@/components/ui/text";
import { CheckCircle2 } from "lucide-react-native";
import { ActivityIndicator, View } from "react-native";

type Props = {
  success: boolean;
};

// Kamera tamamen unmount - loading/success ekranı
export function QrScanStatus({ success }: Props) {
  return (
    <View className="flex-1 items-center justify-center gap-4">
      {success ? (
        <>
          <CheckCircle2 size={64} color="#22c55e" />
          <Text className="text-white text-lg font-medium">
            PDKS kaydı oluşturuldu
          </Text>
        </>
      ) : (
        <>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text className="text-white text-base font-medium">
            Konum doğrulanıyor...
          </Text>
        </>
      )}
    </View>
  );
}
