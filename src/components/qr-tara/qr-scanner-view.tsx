import { Text } from "@/components/ui/text";
import { PdksYon } from "@/types/pdks";
import { BarcodeScanningResult, CameraView } from "expo-camera";
import { LogIn, LogOut } from "lucide-react-native";
import { Pressable, View } from "react-native";

const SCAN_FRAME_SIZE = 260;

type Props = {
  yon: PdksYon;
  onBarcodeScanned: (result: BarcodeScanningResult) => void;
  onYonPress: () => void;
};

export function QrScannerView({ yon, onBarcodeScanned, onYonPress }: Props) {
  const YonIcon = yon === "Giriş" ? LogIn : LogOut;

  return (
    <>
      <CameraView
        style={{ flex: 1 }}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={onBarcodeScanned}
      />

      {/* Seçili yön - dokununca seçim dialogu tekrar açılır */}
      <View className="absolute top-14 left-0 right-0 items-center">
        <Pressable
          onPress={onYonPress}
          className={`flex-row items-center gap-2 rounded-full px-5 py-2 ${
            yon === "Giriş" ? "bg-green-600/90" : "bg-red-600/90"
          }`}
        >
          <YonIcon size={18} color="white" />
          <Text className="text-white text-base font-semibold">{yon}</Text>
        </Pressable>
      </View>

      <View
        className="absolute inset-0 items-center justify-center"
        pointerEvents="none"
      >
        <View
          style={{ width: SCAN_FRAME_SIZE, height: SCAN_FRAME_SIZE }}
          className="relative"
        >
          <View className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-white rounded-tl-2xl" />
          <View className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-white rounded-tr-2xl" />
          <View className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-white rounded-bl-2xl" />
          <View className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-white rounded-br-2xl" />
        </View>
      </View>

      <View className="absolute bottom-36 left-0 right-0 items-center">
        <Text className="text-white text-base font-medium">
          QR kodu çerçeve içine hizalayın
        </Text>
      </View>
    </>
  );
}
