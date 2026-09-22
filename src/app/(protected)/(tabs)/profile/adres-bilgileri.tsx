import { useEffect } from "react";
import { View, ScrollView, ActivityIndicator } from "react-native";
import { useForm } from "react-hook-form";
import { useAuthStore } from "@/stores/auth-store";
import { usePersonelDetay } from "@/hooks/use-personel";
import { FormInput } from "@/components/form/form-input";
import { DetailScreenHeader } from "@/components/detail-screen-header";
import { formatOrEmpty } from "@/lib/format-helpers";
import { useIlceler, useIller } from "@/hooks/use-il-ilce-vergi-data";

type FormValues = {
  Il: string;
  Ilce: string;
  Adres: string;
  Telefon: string;
};

const EMPTY: FormValues = { Il: "", Ilce: "", Adres: "", Telefon: "" };

export default function AdresBilgileriScreen() {
  const user = useAuthStore((state) => state.user);
  const { data: personel, isLoading } = usePersonelDetay(user?.IDSubePersonel);
  const { control, reset } = useForm<FormValues>({ defaultValues: EMPTY });

  const { data: iller = [] } = useIller();
  const { data: ilceler = [] } = useIlceler(personel?.IlKodu || undefined);

  const ilAdi = iller.find((i) => i.IlKodu == personel?.IlKodu)?.IlAdi ?? "";
  const ilceAdi =
    ilceler.find((i) => i.IlceKodu == personel?.IlceKodu)?.IlceAdi ?? "";

  useEffect(() => {
    if (!personel) return;
    reset({
      Il: formatOrEmpty(ilAdi),
      Ilce: formatOrEmpty(ilceAdi),
      Adres: formatOrEmpty(personel.Adres),
      Telefon: formatOrEmpty(personel.Telefon),
    });
  }, [personel, ilAdi, ilceAdi, reset]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <DetailScreenHeader title="Adres Bilgileri" />
      <ScrollView className="flex-1 px-4" contentContainerClassName="py-4 gap-1">
        <FormInput control={control} name="Il" label="İl" disabled />
        <FormInput control={control} name="Ilce" label="İlçe" disabled />
        <FormInput control={control} name="Adres" label="Adres" type="textarea" disabled />
        <FormInput control={control} name="Telefon" label="Telefon" format="tel" disabled />
      </ScrollView>
    </View>
  );
}