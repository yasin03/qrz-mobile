import { useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";

import { useAuthStore } from "@/stores/auth-store";
import { useCreateAvansTalep } from "@/hooks/use-avans";
import { FormInput } from "@/components/form/form-input";
import { FormSheetScreen } from "@/components/ui/form-sheet-screen";
import { FormDatePicker } from "@/components/form/form-date-picker";

const avansTalepSchema = z.object({
  Tutar: z.coerce
    .number({ error: "Tutar giriniz" })
    .min(1, "Tutar 0'dan büyük olmalı"),
  TaksitSayisi: z.coerce
    .number({ error: "Taksit sayısı giriniz" })
    .int("Tam sayı giriniz")
    .min(1, "En az 1 taksit olmalı"),
  BordroKesintiTutari: z.coerce.number(),
  Mesaj: z.string().min(1, "Mesaj giriniz"),
  OdemeBaslangicTarihi: z.string().min(1, "Tarih seçiniz"),
});

type AvansTalepFormInput = z.input<typeof avansTalepSchema>;
type AvansTalepFormOutput = z.output<typeof avansTalepSchema>;

export default function AvansEkle() {
  const user = useAuthStore((state) => state.user);
  const createTalepMutation = useCreateAvansTalep();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AvansTalepFormInput, any, AvansTalepFormOutput>({
    resolver: zodResolver(avansTalepSchema),
    defaultValues: {
      Tutar: undefined,
      TaksitSayisi: undefined,
      BordroKesintiTutari: 0,
      Mesaj: "",
      OdemeBaslangicTarihi: format(new Date(), "yyyy-MM-dd"),
    },
  });

  const tutar = Number(watch("Tutar"));
  const taksitSayisi = Number(watch("TaksitSayisi"));

  useEffect(() => {
    const bordroKesintiTutari =
      tutar && taksitSayisi ? Number((tutar / taksitSayisi).toFixed(2)) : 0;
    setValue("BordroKesintiTutari", bordroKesintiTutari, {
      shouldValidate: false,
    });
  }, [tutar, taksitSayisi, setValue]);

  const onSubmit = (values: AvansTalepFormOutput) => {
    if (!user?.IDSubePersonel) return;
    const payload = {
      IDSubePersonel: user.IDSubePersonel,
      Tutar: Number(values.Tutar),
      TaksitSayisi: Number(values.TaksitSayisi),
      BordroKesintiTutari: Number(values.BordroKesintiTutari),
      Mesaj: values.Mesaj,
      OdemeBaslangicTarihi: values.OdemeBaslangicTarihi,
    };

    createTalepMutation.mutate(payload, {
      onSuccess: () => router.back(),
    });
  };

  return (
    <FormSheetScreen
      title="Yeni Avans Talebi"
      footer={
        <Pressable
          onPress={handleSubmit(onSubmit)}
          disabled={createTalepMutation.isPending}
          className="items-center rounded-lg bg-qrz-navy py-3 disabled:opacity-50"
        >
          {createTalepMutation.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-sm font-medium text-white">Talebi Gönder</Text>
          )}
        </Pressable>
      }
    >
      <FormInput
        control={control}
        name="Tutar"
        label="Tutar"
        placeholder="Talep edilen tutar"
        format="money"
      />

      <FormInput
        control={control}
        name="TaksitSayisi"
        label="Taksit Sayısı"
        placeholder="Talep edilen taksit sayısı"
        format="number"
      />

      <FormInput
        control={control}
        name="BordroKesintiTutari"
        label="Aylık Ödenen Tutar"
        placeholder=""
        format="money"
        disabled
      />

      <FormDatePicker
        control={control}
        name="OdemeBaslangicTarihi"
        label="Ödeme Başlangıç Tarihi"
        placeholder="Tarih seçin"
      />

      <FormInput
        control={control}
        name="Mesaj"
        label="Mesaj"
        type="textarea"
        placeholder="Mesaj (opsiyonel)"
      />
    </FormSheetScreen>
  );
}
