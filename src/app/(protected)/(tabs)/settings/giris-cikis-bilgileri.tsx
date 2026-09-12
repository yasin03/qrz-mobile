import { useEffect } from "react";
import { View, ScrollView, ActivityIndicator } from "react-native";
import { useForm } from "react-hook-form";
import { useAuthStore } from "@/stores/auth-store";
import { usePersonelDetay } from "@/hooks/use-personel";
import { FormInput } from "@/components/form/form-input";
import { DetailScreenHeader } from "@/components/detail-screen-header";
import { formatTarih, formatBool, formatOrEmpty } from "@/lib/format-helpers";
import { useSabitTanimlar } from "@/hooks/use-sabit-tanimlar";

type FormValues = {
  SgkDurumu: string;
  IseIlkGirisTarihi: string;
  IseSonGirisTarihi: string;
  CalismaDurumu: string; // not: VardiyaliCalismaDurumu data'da yok
  AzCalismaDurumu: string;
  AzCalismaDurumuGunSayisi: string;
};

const EMPTY: FormValues = {
  SgkDurumu: "",
  IseIlkGirisTarihi: "",
  IseSonGirisTarihi: "",
  CalismaDurumu: "",
  AzCalismaDurumu: "",
  AzCalismaDurumuGunSayisi: "",
};

export default function GirisCikisBilgileriScreen() {
  const user = useAuthStore((state) => state.user);
  const { data: personel, isLoading } = usePersonelDetay(user?.IDSubePersonel);
  const { control, reset } = useForm<FormValues>({ defaultValues: EMPTY });
  const { sgkDurumlari, calismaDurumlari } = useSabitTanimlar();

  const sgkDurumuAdi =
    sgkDurumlari.find((o) => String(o.value) === String(personel?.SgkDurumu))
      ?.label ?? "";

  const calismaDurumuAdi =
    calismaDurumlari.find((o) => String(o.value) === String(personel?.CalismaDurumu))
      ?.label ?? "";

  useEffect(() => {
    if (!personel) return;
    reset({
      SgkDurumu: formatOrEmpty(sgkDurumuAdi),
      IseIlkGirisTarihi: formatTarih(personel.IseIlkGirisTarihi),
      IseSonGirisTarihi: formatTarih(personel.IseSonGirisTarihi),
      CalismaDurumu: formatOrEmpty(calismaDurumuAdi),
      AzCalismaDurumu: formatBool(personel.AzCalismaDurumu as boolean),
      AzCalismaDurumuGunSayisi: formatOrEmpty(
        personel.AzCalismaDurumuGunSayisi as number,
      ),
    });
  }, [personel, sgkDurumuAdi, reset]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <DetailScreenHeader title="Giriş/Çıkış Bilgileri" />
      <ScrollView
        className="flex-1 px-4"
        contentContainerClassName="py-4 gap-1"
      >
        <FormInput
          control={control}
          name="SgkDurumu"
          label="SGK Durumu"
          disabled
        />
        <FormInput
          control={control}
          name="IseIlkGirisTarihi"
          label="İşe İlk Giriş Tarihi"
          disabled
        />
        <FormInput
          control={control}
          name="IseSonGirisTarihi"
          label="İşe Son Giriş Tarihi"
          disabled
        />
        <FormInput
          control={control}
          name="CalismaDurumu"
          label="Çalışma Durumu"
          disabled
        />
        <FormInput
          control={control}
          name="AzCalismaDurumu"
          label="Az Çalışma Durumu"
          disabled
        />
        <FormInput
          control={control}
          name="AzCalismaDurumuGunSayisi"
          label="Az Çalışma Gün Sayısı"
          disabled
        />
      </ScrollView>
    </View>
  );
}
