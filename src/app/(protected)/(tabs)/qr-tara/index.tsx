import { usePermissions } from "@/hooks/use-permissions";
import { useRole } from "@/hooks/use-role";
import { ROLE_GROUPS } from "@/lib/user-types";
import { useRouter, useIsFocused } from "expo-router";
import { BarcodeScanningResult } from "expo-camera";
import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import { View, Alert } from "react-native";
import { usePdksMutation } from "@/hooks/use-pdks";
import { ApiClientError } from "@/lib/axios";
import { PdksYon } from "@/types/pdks";
import { IzinYok } from "@/components/qr-tara/izin-yok";
import { QrScanStatus } from "@/components/qr-tara/qr-scan-status";
import { QrScannerView } from "@/components/qr-tara/qr-scanner-view";
import { YonSecilmedi } from "@/components/qr-tara/yon-secilmedi";
import { YonSecimDialog } from "@/components/qr-tara/yon-secim-dialog";
import {
  getPositionWithTimeout,
  parseQrPayload,
} from "@/components/qr-tara/utils";

const QRTara = () => {
  const router = useRouter();
  const { hasRole } = useRole();
  const { ensurePermissions, permissionsGranted } = usePermissions();
  const pdksMutation = usePdksMutation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [yon, setYon] = useState<PdksYon | null>(null);
  const [yonDialogVisible, setYonDialogVisible] = useState(false);
  const scanLockRef = useRef(false);
  const isFocused = useIsFocused();
  const isFocusedRef = useRef(isFocused);

  useEffect(() => {
    isFocusedRef.current = isFocused;

    // Sayfaya her gelişte tarama durumu ve yön seçimi sıfırlanır, dialog açılır
    if (isFocused) {
      setScanSuccess(false);
      scanLockRef.current = false;
      setYon(null);
      setYonDialogVisible(true);
    } else {
      setYonDialogVisible(false);
    }
  }, [isFocused]);

  function alertIfFocused(...args: Parameters<typeof Alert.alert>) {
    if (isFocusedRef.current) {
      Alert.alert(...args);
    }
  }

  useEffect(() => {
    ensurePermissions();
  }, []);

  const handleYonSelect = (selected: PdksYon) => {
    setYon(selected);
    setYonDialogVisible(false);
  };

  const handleLocationPress = () => {
    setYonDialogVisible(false);
    router.push("/lokasyon");
  };

  const handleBarcodeScanned = async (result: BarcodeScanningResult) => {
    if (!yon || scanLockRef.current || isProcessing) return;
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
        alertIfFocused("Hata", "QR kod okunamadı veya format geçersiz.");
        scanLockRef.current = false;
        return;
      }

      const position = await getPositionWithTimeout(
        { accuracy: Location.Accuracy.High },
        12000,
      );

      if (position.mocked) {
        alertIfFocused(
          "Hata",
          "Sahte konum tespit edildi. Kayıt oluşturulamaz.",
        );
        scanLockRef.current = false;
        return;
      }
      const payload = {
        idBolum,
        idBolumLokasyon,
        position,
        yon,
      };

      const { test, sonuc } = await pdksMutation.mutateAsync(payload);

      if (test !== 1) {
        // Kayıt reddedildi (ör. bugün zaten giriş/çıkış var) - kamera açılmadan yön seçimine dön
        setYon(null);
        alertIfFocused(
          "Uyarı",
          sonuc || "İşlem gerçekleştirilemedi.",
          [
            {
              text: "Tamam",
              onPress: () => {
                scanLockRef.current = false;
                setYonDialogVisible(true);
              },
            },
          ],
          { cancelable: false },
        );
        return;
      }

      setScanSuccess(true);

      const { latitude, longitude, accuracy } = position.coords;

      alertIfFocused(
        "PDKS Kaydı Oluşturuldu",
        `${sonuc}\n\n` +
          `Yön: ${yon}\n\n` +
          `QR Verisi:\n` +
          `Bölüm Lokasyon: ${idBolumLokasyon}\n` +
          `Bölüm: ${idBolum}\n` +
          `Enlem: ${enlem}\n` +
          `Boylam: ${boylam}\n\n` +
          `Telefon Konum Verisi:\n` +
          `Enlem: ${latitude}\n` +
          `Boylam: ${longitude}\n` +
          `Doğruluk: ${accuracy != null ? `${accuracy.toFixed(1)} m` : "-"}\n` +
          `Zaman: ${new Date(position.timestamp).toLocaleString("tr-TR")}`,
        [
          {
            text: "Tamam",
            onPress: () => {
              setScanSuccess(false);
              scanLockRef.current = false;
              router.replace("/(protected)/(tabs)/pdks");
            },
          },
        ],
        // Başarı ekranı (kamera kapalı) Tamam'a basılana kadar kalır
        { cancelable: false },
      );
    } catch (error) {
      if ((error as Error).message === "LOCATION_TIMEOUT") {
        alertIfFocused(
          "Hata",
          "Konum alınamadı, lütfen açık alanda tekrar deneyin.",
        );
      } else if (error instanceof ApiClientError) {
        alertIfFocused("Hata", error.message);
      } else {
        console.error("QR tarama hatası:", error);
        alertIfFocused("Hata", "QR işlenemedi. Lütfen tekrar deneyin.");
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
            <QrScanStatus success={scanSuccess} />
          ) : !yon ? (
            <YonSecilmedi onPress={() => setYonDialogVisible(true)} />
          ) : (
            <QrScannerView
              yon={yon}
              onBarcodeScanned={handleBarcodeScanned}
              onYonPress={() => setYonDialogVisible(true)}
            />
          )}
        </View>
      ) : (
        <IzinYok />
      )}

      <YonSecimDialog
        visible={yonDialogVisible}
        onSelect={handleYonSelect}
        onClose={() => setYonDialogVisible(false)}
        showLocationButton={hasRole(ROLE_GROUPS.ADMIN_VE_YONETICI)}
        onLocationPress={handleLocationPress}
      />
    </View>
  );
};

export default QRTara;
