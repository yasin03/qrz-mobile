import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { usePermissions } from "@/hooks/use-permissions";
import { useRole } from "@/hooks/use-role";
import { ROLE_GROUPS } from "@/lib/user-types";
import { useRouter } from "expo-router";
import { CameraView, BarcodeScanningResult } from "expo-camera";
import * as Location from "expo-location";
import { LocationEdit, XCircle } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { View, Alert, SafeAreaView } from "react-native";

const SCAN_FRAME_SIZE = 260;

const QRTara = () => {
  const router = useRouter();
  const { hasRole } = useRole();
  const { ensurePermissions } = usePermissions();
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const scanLockRef = useRef(false);

  useEffect(() => {
    (async () => {
      const ok = await ensurePermissions();
      setPermissionsGranted(ok);
    })();
  }, []);

  const handleNewPagePress = () => router.push("/(protected)/location");

  const handleBarcodeScanned = async (result: BarcodeScanningResult) => {
    if (scanLockRef.current || isProcessing) return;
    scanLockRef.current = true;
    setIsProcessing(true);

    try {
      let qrLat: number | null = null;
      let qrLon: number | null = null;

      try {
        const parsed = JSON.parse(result.data);
        qrLat = parsed.lat ?? parsed.latitude ?? null;
        qrLon = parsed.lon ?? parsed.lng ?? parsed.longitude ?? null;
      } catch {
        Alert.alert("Hata", "QR kod okunamadı veya format geçersiz.");
        return;
      }

      if (qrLat === null || qrLon === null) {
        Alert.alert("Hata", "QR kodda konum bilgisi bulunamadı.");
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      Alert.alert(
        "QR Okundu",
        `QR Konum: ${qrLat}, ${qrLon}\n` +
          `Mevcut Konum: ${position.coords.latitude}, ${position.coords.longitude}`,
        [{ text: "Tamam", onPress: () => { scanLockRef.current = false; } }]
      );
    } catch {
      Alert.alert("Hata", "Konum alınamadı.");
      scanLockRef.current = false;
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View className="flex-1 bg-black">
      {permissionsGranted ? (
        <View className="flex-1">
          <CameraView
            style={{ flex: 1 }}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={scanLockRef.current ? undefined : handleBarcodeScanned}
          />

          {/* Admin/yönetici için sağ üstte overlay buton */}
          {hasRole(ROLE_GROUPS.ADMIN_VE_YONETICI) && (
            <View className="absolute top-14 right-5 left-0">
              <View className="items-end px-4 pt-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-black/40 rounded-full"
                  onPress={handleNewPagePress}
                >
                  <LocationEdit size={30} color="white" />
                </Button>
              </View>
            </View>
          )}

          {/* Scan frame overlay */}
          <View className="absolute inset-0 items-center justify-center">
            <View style={{ width: SCAN_FRAME_SIZE, height: SCAN_FRAME_SIZE }} className="relative">
              <View className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-white rounded-tl-2xl" />
              <View className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-white rounded-tr-2xl" />
              <View className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-white rounded-bl-2xl" />
              <View className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-white rounded-br-2xl" />
            </View>
          </View>

          <View className="absolute bottom-10 left-0 right-0 items-center">
            <Text className="text-white text-base font-medium">
              {isProcessing ? "İşleniyor..." : "QR kodu çerçeve içine hizalayın"}
            </Text>
          </View>
        </View>
      ) : (
        <View className="flex-1 items-center justify-center gap-3 px-6">
          <XCircle size={48} color="#ef4444" />
          <Text className="text-white text-lg font-medium text-center">
            Kamera ve konum izni verilmedi
          </Text>
          <Text className="text-gray-400 text-sm text-center">
            QR okutabilmek için izinleri Ayarlar'dan açmanız gerekiyor.
          </Text>
        </View>
      )}
    </View>
  );
};

export default QRTara;