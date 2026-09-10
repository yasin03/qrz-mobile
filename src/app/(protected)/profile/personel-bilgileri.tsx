import { useEffect } from "react";
import { View, ScrollView, ActivityIndicator } from "react-native";
import { useForm } from "react-hook-form";
import { useAuthStore } from "@/stores/auth-store";
import { usePersonelDetay } from "@/hooks/use-personel";
import { FormInput } from "@/components/form/form-input";
import { DetailScreenHeader } from "@/components/detail-screen-header";
import { formatTarih, formatOrEmpty } from "@/lib/format-helpers";
import { useSabitTanimlar } from "@/hooks/use-sabit-tanimlar";

type FormValues = {
  TcKimlikNo: string;
  Ad: string;
  Soyad: string;
  IlkSoyad: string;
  DogumTarihi: string;
  Cinsiyet: string;
  Uyruk: string;
  OgrenimDurumu: string;
  MezuniyetYili: string;
  MezuniyetBolumu: string;
};

const EMPTY: FormValues = {
  TcKimlikNo: "",
  Ad: "",
  Soyad: "",
  IlkSoyad: "",
  DogumTarihi: "",
  Cinsiyet: "",
  Uyruk: "",
  OgrenimDurumu: "",
  MezuniyetYili: "",
  MezuniyetBolumu: "",
};

export default function PersonelBilgileriScreen() {
  const user = useAuthStore((state) => state.user);
  const { data: personel, isLoading } = usePersonelDetay(user?.IDSubePersonel);
  const { control, reset } = useForm<FormValues>({ defaultValues: EMPTY });
  const { ogrenimDurumlari, uyruklar } = useSabitTanimlar();

  const ogrenimDurumuAdi =
    ogrenimDurumlari.find(
      (o) => String(o.value) === String(personel?.OgrenimDurumu),
    )?.label ?? "";

  const uyrukAdi =
    uyruklar.find((u) => String(u.value) === String(personel?.Uyruk))?.label ??
    "";

  useEffect(() => {
    if (!personel) return;
    reset({
      TcKimlikNo: formatOrEmpty(personel.TcKimlikNo),
      Ad: formatOrEmpty(personel.Ad),
      Soyad: formatOrEmpty(personel.Soyad),
      IlkSoyad: formatOrEmpty(personel.IlkSoyad),
      DogumTarihi: formatTarih(personel.DogumTarihi),
      Cinsiyet: formatOrEmpty(personel.Cinsiyet),
      Uyruk: formatOrEmpty(uyrukAdi),
      OgrenimDurumu: formatOrEmpty(ogrenimDurumuAdi),
      MezuniyetYili: formatOrEmpty(personel.MezuniyetYili),
      MezuniyetBolumu: formatOrEmpty(personel.MezuniyetBolumu),
    });
  }, [personel, ogrenimDurumuAdi, uyrukAdi, reset]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <DetailScreenHeader title="Personel Bilgileri" />
      <ScrollView
        className="flex-1 px-4"
        contentContainerClassName="py-4 gap-1"
      >
        <FormInput
          control={control}
          name="TcKimlikNo"
          label="TC Kimlik No"
          format="tcno"
          disabled
        />
        <FormInput control={control} name="Ad" label="Adı" disabled />
        <FormInput control={control} name="Soyad" label="Soyadı" disabled />
        <FormInput
          control={control}
          name="IlkSoyad"
          label="İlk Soyadı"
          disabled
        />
        <FormInput
          control={control}
          name="DogumTarihi"
          label="Doğum Tarihi"
          disabled
        />
        <FormInput
          control={control}
          name="Cinsiyet"
          label="Cinsiyet"
          disabled
        />
        <FormInput control={control} name="Uyruk" label="Uyruk" disabled />
        <FormInput
          control={control}
          name="OgrenimDurumu"
          label="Öğrenim Durumu"
          disabled
        />
        <FormInput
          control={control}
          name="MezuniyetYili"
          label="Mezuniyet Yılı"
          disabled
        />
        <FormInput
          control={control}
          name="MezuniyetBolumu"
          label="Mezuniyet Bölümü"
          disabled
        />
      </ScrollView>
    </View>
  );
}
