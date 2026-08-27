import { Text } from "@/components/ui/text";
import { usePermissions } from "@/hooks/use-permissions";
import { useEffect, useState } from "react";
import { View } from "react-native";

const QRTara = () => {
  const { ensurePermissions } = usePermissions();
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const handleQrOkutPress = async () => {
    const ok = await ensurePermissions();
    setPermissionsGranted(ok);
  };

  useEffect(() => {
    handleQrOkutPress();
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-lg font-medium text-qrz-navy">QR-Tara</Text>
      <Text className=" font-medium text-qrz-navy">
        {permissionsGranted
          ? "kamera ve konum izin verildi"
          : "kamera ve konum izin verilmedi"}
      </Text>
    </View>
  );
};

export default QRTara;
