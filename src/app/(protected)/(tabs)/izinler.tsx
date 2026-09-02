import { View, Text } from "react-native";
import * as Device from "expo-device";
import * as Application from "expo-application";
import { getDeviceInfo } from "@/lib/device";
import { useEffect } from "react";

const Izinler =  () => {
  
  useEffect(() => {
    const fetchDeviceInfo = async () => {
      const deviceInfo = await getDeviceInfo();
    };

    fetchDeviceInfo();
  }, []);
  const device = {
    DeviceType: {
      "0": "UNKNOWN",
      "1": "PHONE",
      "2": "TABLET",
      "3": "DESKTOP",
      "4": "TV",
      DESKTOP: 3,
      PHONE: 1,
      TABLET: 2,
      TV: 4,
      UNKNOWN: 0,
    },
    brand: "Apple",
    designName: null,
    deviceName: "iPhone 17 Pro",
    deviceType: 1,
    deviceYearClass: 2026,
    isDevice: false,
    manufacturer: "Apple",
    modelId: "arm64",
    modelName: "Simulator iOS",
    osBuildFingerprint: null,
    osBuildId: "25F84",
    osInternalBuildId: "25F84",
    osName: "iOS",
    osVersion: "26.5",
    platformApiLevel: null,
    productName: null,
    supportedCpuArchitectures: ["arm64e"],
    totalMemory: 51539607552,
  };
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-lg font-medium text-qrz-navy">İzinler</Text>
    </View>
  );
};

export default Izinler;
