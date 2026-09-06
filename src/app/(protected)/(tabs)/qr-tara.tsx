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

  const pdksMutation = {
    mutate: async (data: {
      idBolumLokasyon: number;
      idBolum: number;
      enlem: number;
      boylam: number;
      kullaniciEnlem: number;
      kullaniciBoylam: number;
    }) => {
      try {
        const response = await fetch(
          "https://api.example.com/pdks-kayit", // Replace with your actual API endpoint
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          },
        );

        if (!response.ok) {
          throw new Error("PDKS kaydı oluşturulamadı.");
        }

        Alert.alert("Başarılı", "PDKS kaydı başarıyla oluşturuldu.");
      } catch (error) {
        Alert.alert("Hata", (error as Error).message);
      }
    },
  };

  function parseQrPayload(qrText: string) {
    const [idBolumLokasyon, idBolum, enlem, boylam] = qrText.split("|");
    return {
      idBolumLokasyon: Number(idBolumLokasyon),
      idBolum: Number(idBolum),
      enlem: Number(enlem),
      boylam: Number(boylam),
    };
  }

  function getDistanceInMeters(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) {
    const R = 6371000; // dünya yarıçapı (metre)
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  const MAX_DISTANCE_METERS = 100; // toleransı projene göre ayarla

  const handleBarcodeScanned = async (result: BarcodeScanningResult) => {
    if (scanLockRef.current || isProcessing) return;
    scanLockRef.current = true;
    setIsProcessing(true);

    try {
      const { idBolumLokasyon, idBolum, enlem, boylam } = parseQrPayload(
        result.data,
      );

      if (
        !idBolumLokasyon ||
        !idBolum ||
        Number.isNaN(enlem) ||
        Number.isNaN(boylam)
      ) {
        Alert.alert("Hata", "QR kod okunamadı veya format geçersiz.");
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      // Android'de sahte konum (mock location) kontrolü — güvenlik için önerilir
      if (position.mocked) {
        Alert.alert("Hata", "Sahte konum tespit edildi. Kayıt oluşturulamaz.");
        return;
      }

      const distance = getDistanceInMeters(
        enlem,
        boylam,
        position.coords.latitude,
        position.coords.longitude,
      );

      if (distance > MAX_DISTANCE_METERS) {
        Alert.alert(
          "Konum Uyuşmuyor",
          `Bulunduğunuz konum, QR kodun bulunduğu konumdan ${Math.round(
            distance,
          )} metre uzakta. PDKS kaydı oluşturulamadı.`,
        );
        return;
      }
      Alert.alert("Başarılı", "Konum doğrulandı. PDKS kaydı oluşturuluyor...");
      // PDKS kaydı için mutation tetikleme
/*       pdksMutation.mutate({
        idBolumLokasyon,
        idBolum,
        enlem,
        boylam,
        kullaniciEnlem: position.coords.latitude,
        kullaniciBoylam: position.coords.longitude,
      }); */
    } catch {
      Alert.alert("Hata", "Konum alınamadı veya QR işlenemedi.");
    } finally {
      scanLockRef.current = false;
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
            onBarcodeScanned={
              scanLockRef.current ? undefined : handleBarcodeScanned
            }
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

          <View className="absolute bottom-10 left-0 right-0 items-center">
            <Text className="text-white text-base font-medium">
              {isProcessing
                ? "İşleniyor..."
                : "QR kodu çerçeve içine hizalayın"}
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
