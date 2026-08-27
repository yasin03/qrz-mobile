import { useCameraPermissions } from 'expo-camera';
import { useForegroundPermissions } from 'expo-location';
import { Linking, Alert, AppState } from 'react-native';
import { useEffect, useCallback } from 'react';

export function usePermissions() {
  const [cameraPerm, requestCamera] = useCameraPermissions();
  const [locationPerm, requestLocation] = useForegroundPermissions();

  // Uygulama foreground'a dönünce izinleri tazele
  // (kullanıcı Ayarlar'dan değiştirmiş olabilir)
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        cameraPerm?.status; // yeniden fetch tetiklenir (hook zaten refresh eder)
      }
    });
    return () => sub.remove();
  }, []);

  const ensurePermissions = useCallback(async (): Promise<boolean> => {
    let cam = cameraPerm;
    let loc = locationPerm;

    if (!cam?.granted) {
      if (cam?.canAskAgain !== false) {
        const res = await requestCamera();
        cam = res;
      }
    }

    if (!loc?.granted) {
      if (loc?.canAskAgain !== false) {
        const res = await requestLocation();
        loc = res;
      }
    }

    if (!cam?.granted || !loc?.granted) {
      const blocked = cam?.canAskAgain === false || loc?.canAskAgain === false;
      Alert.alert(
        'İzin Gerekli',
        blocked
          ? 'QR okutabilmek için kamera ve konum izinlerini Ayarlar üzerinden açmalısınız.'
          : 'PDKS kaydı oluşturmak için kamera ve konum izni vermeniz gerekiyor.',
        blocked
          ? [
              { text: 'Vazgeç', style: 'cancel' },
              { text: 'Ayarlara Git', onPress: () => Linking.openSettings() },
            ]
          : [{ text: 'Tamam' }]
      );
      return false;
    }

    return true;
  }, [cameraPerm, locationPerm, requestCamera, requestLocation]);

  return { ensurePermissions, cameraPerm, locationPerm };
}