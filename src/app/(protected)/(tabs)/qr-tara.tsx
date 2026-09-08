import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { usePermissions } from "@/hooks/use-permissions";
import { useRole } from "@/hooks/use-role";
import { ROLE_GROUPS } from "@/lib/user-types";
import { useRouter } from "expo-router";
import { CameraView, BarcodeScanningResult } from "expo-camera";
import * as Location from "expo-location";
import { CheckCircle2, LocationEdit, XCircle } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { View, Alert, SafeAreaView, ActivityIndicator } from "react-native";
import { getDeviceId } from "@/lib/device";
import { usePdksMutation } from "@/hooks/use-pdks";
import { ApiClientError } from "@/lib/axios";

const SCAN_FRAME_SIZE = 260;

const QRTara = () => {
  const router = useRouter();
  const { hasRole } = useRole();
  const { ensurePermissions } = usePermissions();
  const pdksMutation = usePdksMutation();
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const scanLockRef = useRef(false);
  const [idDevice, setIdDevice] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const ok = await ensurePermissions();
      const id = await getDeviceId();
      setIdDevice(id);
      setPermissionsGranted(ok);
    })();
  }, []);

  const handleNewPagePress = () => router.push("/(protected)/location");

  function parseQrPayload(qrText: string) {
    const [idBolumLokasyon, idBolum, enlem, boylam] = qrText.split("|");
    return {
      idBolumLokasyon: Number(idBolumLokasyon),
      idBolum: Number(idBolum),
      enlem: Number(enlem),
      boylam: Number(boylam),
    };
  }

  function getPositionWithTimeout(
    options: Location.LocationOptions,
    timeoutMs: number,
  ): Promise<Location.LocationObject> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(async () => {
        const lastKnownPosition = await Location.getLastKnownPositionAsync({
          maxAge: 60_000,
          requiredAccuracy: 100,
        });

        if (lastKnownPosition) {
          resolve(lastKnownPosition);
        } else {
          reject(new Error("LOCATION_TIMEOUT"));
        }
      }, timeoutMs);

      Location.getCurrentPositionAsync(options).then(
        (position) => {
          clearTimeout(timeout);
          resolve(position);
        },
        (error) => {
          clearTimeout(timeout);
          reject(error);
        },
      );
    });
  }

  const handleBarcodeScanned = async (result: BarcodeScanningResult) => {
    if (scanLockRef.current || isProcessing) return;
    scanLockRef.current = true;
    setIsProcessing(true); // kamera burada kapanacak (aşağıdaki render'a bak)

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
        scanLockRef.current = false;
        return;
      }

      const position = await getPositionWithTimeout(
        { accuracy: Location.Accuracy.High },
        12000,
      );

      if (position.mocked) {
        Alert.alert("Hata", "Sahte konum tespit edildi. Kayıt oluşturulamaz.");
        scanLockRef.current = false;
        return;
      }

      await pdksMutation.mutateAsync({
        idBolum,
        idBolumLokasyon,
        position,
      });
      setScanSuccess(true);

      setTimeout(() => {
        router.replace("/(protected)/(tabs)"); // kendi ana sayfa route'unla değiştir
        setScanSuccess(false);
        scanLockRef.current = false;
      }, 1200);
    } catch (error) {
      if ((error as Error).message === "LOCATION_TIMEOUT") {
        Alert.alert(
          "Hata",
          "Konum alınamadı, lütfen açık alanda tekrar deneyin.",
        );
      } else if (error instanceof ApiClientError) {
        Alert.alert("Hata", error.message);
      } else {
        console.error("QR tarama hatası:", error);
        Alert.alert("Hata", "QR işlenemedi. Lütfen tekrar deneyin.");
      }
      scanLockRef.current = false;
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View className="flex-1 bg-black">
      {permissionsGranted ? (
        <View className="flex-1">
          {isProcessing || scanSuccess ? (
            // Kamera tamamen unmount - loading/success ekranı
            <View className="flex-1 items-center justify-center gap-4">
              {scanSuccess ? (
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
          ) : (
            <>
              <CameraView
                style={{ flex: 1 }}
                facing="back"
                barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                onBarcodeScanned={handleBarcodeScanned}
              />

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

              <View className="absolute bottom-36 left-0 right-0 items-center">
                <Text className="text-white text-base font-medium">
                  QR kodu çerçeve içine hizalayın
                </Text>
              </View>
            </>
          )}
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
