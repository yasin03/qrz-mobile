import { useForm } from "react-hook-form";
import { View, ScrollView } from "react-native";
import * as Device from "expo-device";
import { FormInput } from "@/components/form/form-input";
import { DetailScreenHeader } from "@/components/detail-screen-header";

type FormValues = { Cihaz: string; Marka: string; Sistem: string };

export default function CihazBilgileriScreen() {
  const { control } = useForm<FormValues>({
    defaultValues: {
      Cihaz: Device.deviceName ?? "-",
      Marka: Device.brand ?? "-",
      Sistem: `${Device.osName ?? "-"} ${Device.osVersion ?? ""}`,
    },
  });

  return (
    <View className="flex-1 bg-white">
      <DetailScreenHeader title="Cihaz Bilgileri" />
      <ScrollView
        className="flex-1 px-4"
        contentContainerClassName="py-4 gap-1"
      >
        <FormInput control={control} name="Cihaz" label="Cihaz" disabled />
        <FormInput control={control} name="Marka" label="Marka" disabled />
        <FormInput control={control} name="Sistem" label="Sistem" disabled />
      </ScrollView>
    </View>
  );
}
