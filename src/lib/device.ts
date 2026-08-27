import * as Device from "expo-device";
import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";

const DEVICE_ID_KEY = "qrz_device_id";

let deviceIdPromise: Promise<string> | null = null;

async function resolveDeviceId(): Promise<string> {
  const existing = await SecureStore.getItemAsync(DEVICE_ID_KEY);
  if (existing) return existing;

  const newId = Crypto.randomUUID();
  await SecureStore.setItemAsync(DEVICE_ID_KEY, newId);
  return newId;
}

export async function getDeviceId(): Promise<string> {
  if (!deviceIdPromise) {
    deviceIdPromise = resolveDeviceId();
  }
  return deviceIdPromise;
}

export async function getDeviceInfo() {
  const deviceId = await getDeviceId();

  return {
    DeviceId: deviceId,
    DeviceName: Device.deviceName ?? null,
    Brand: Device.brand ?? null,
    Manufacturer: Device.manufacturer ?? null,
    ModelName: Device.modelName ?? null,
    ModelId: Device.modelId ?? null,
    OSName: Device.osName ?? null,
    OSVersion: Device.osVersion ?? null,
    DeviceType: Device.deviceType ?? null,
    DeviceYearClass: Device.deviceYearClass ?? null,
  };
}
