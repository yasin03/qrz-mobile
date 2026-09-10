import { useEffect } from "react";
import { View, ScrollView, ActivityIndicator } from "react-native";
import { useForm } from "react-hook-form";
import { useAuthStore } from "@/stores/auth-store";
import { usePersonelDetay } from "@/hooks/use-personel";
import { FormInput } from "@/components/form/form-input";
import { DetailScreenHeader } from "@/components/detail-screen-header";
import { formatBool, formatOrEmpty } from "@/lib/format-helpers";
import { useSabitTanimlar } from "@/hooks/use-sabit-tanimlar";

type FormValues = {
  OdemeSekli: string;
  UcretTipi: string;
  AsgeriUcretli: string;
  Ucret: string;
  GunlukUcret: string;
  SaatlikUcret: string;
};

const EMPTY: FormValues = {
  OdemeSekli: "",
  UcretTipi: "",
  AsgeriUcretli: "",
  Ucret: "",
  GunlukUcret: "",
  SaatlikUcret: "",
};

export default function BordroBilgileriScreen() {
  const user = useAuthStore((state) => state.user);
  const { data: personel, isLoading } = usePersonelDetay(user?.IDSubePersonel);
  const { control, reset } = useForm<FormValues>({ defaultValues: EMPTY });
  const { ucretTipleri, odemeSekilleri } = useSabitTanimlar();

  const ucretTipiAdi =
    ucretTipleri.find(
      (o) => String(o.value) === String(personel?.UcretTipi),
    )?.label ?? "";

  const odemeSekliAdi =
    odemeSekilleri.find((u) => String(u.value) === String(personel?.OdemeSekli))?.label ??
    "";

  useEffect(() => {
    if (!personel) return;
    reset({
      OdemeSekli: formatOrEmpty(odemeSekliAdi),
      UcretTipi: formatOrEmpty(ucretTipiAdi),
      AsgeriUcretli: formatBool(personel.AsgeriUcretli as boolean),
      Ucret: String(personel.Ucret ?? 0),
      GunlukUcret: String(personel.GunlukUcret ?? 0),
      SaatlikUcret: String(personel.SaatlikUcret ?? 0),
    });
  }, [personel,ucretTipiAdi,odemeSekliAdi, reset]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <DetailScreenHeader title="Bordro Bilgileri" />
      <ScrollView
        className="flex-1 px-4"
        contentContainerClassName="py-4 gap-1"
      >
        <FormInput
          control={control}
          name="OdemeSekli"
          label="Ödeme Şekli"
          disabled
        />
        <FormInput
          control={control}
          name="UcretTipi"
          label="Ücret Tipi"
          disabled
        />
        <FormInput
          control={control}
          name="AsgeriUcretli"
          label="Asgari Ücretli"
          disabled
        />
        <FormInput
          control={control}
          name="Ucret"
          label="Ücret"
          format="money"
          disabled
        />
        <FormInput
          control={control}
          name="GunlukUcret"
          label="Günlük Ücret"
          format="money"
          disabled
        />
        <FormInput
          control={control}
          name="SaatlikUcret"
          label="Saatlik Ücret"
          format="money"
          disabled
        />
      </ScrollView>
    </View>
  );
}
