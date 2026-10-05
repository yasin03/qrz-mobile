import { useMemo } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { X } from "lucide-react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";

import { FormInput } from "@/components/form/form-input";
import { FormSelect } from "@/components/form/form-select";
import { FormDatePicker } from "@/components/form/form-date-picker";
import { FormSwitch } from "@/components/form/form-switch";
import { FormMultiSelect } from "@/components/form/form-multi-select";
import {
  useInsertEklenti,
  useInsertKesinti,
  useUpdateEklenti,
  useUpdateKesinti,
} from "@/hooks/use-bordro-parametre";
import { useAktifPersonelListesi } from "@/hooks/use-personel";
import { usePersonelSabitTanimlar } from "@/hooks/use-sabit-tanimlar";
import { useAuthStore } from "@/stores/auth-store";
import { PARAMETRE_CONFIG, type ParametreTur } from "./parametre-config";

const schema = z.object({
  personeller: z.array(z.string()),
  tip: z.string().min(1, "Tip seçiniz"),
  tutar: z
    .string()
    .min(1, "Tutar giriniz")
    .refine((v) => Number(v) > 0, "Tutar 0'dan büyük olmalı"),
  tarih: z.string().min(1, "Tarih seçiniz"),
  net: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

/** Düzenleme modunda listeden route param olarak gelen kayıt bilgileri */
type DuzenleParams = {
  id?: string;
  AdSoyad?: string;
  BolumAdi?: string;
  tutar?: string;
  tarih?: string;
  tip?: string;
  net?: string;
};

// API tarihi ("2026-01-15T00:00:00.000Z" vb.) → "yyyy-MM-dd"
function toFormTarih(value?: string) {
  if (!value) return format(new Date(), "yyyy-MM-dd");
  const match = /^\d{4}-\d{2}-\d{2}/.exec(value);
  return match ? match[0] : format(new Date(value), "yyyy-MM-dd");
}

function isBasarili(result: { test?: number | string } | undefined) {
  return !result || Number(result.test) === 1;
}

// Eklenti / kesinti ekleme ve düzenleme formu (sadece admin / yönetici)
export function ParametreForm({ tur }: { tur: ParametreTur }) {
  const config = PARAMETRE_CONFIG[tur];
  const params = useLocalSearchParams<DuzenleParams>();
  const isEdit = Boolean(params.id);

  const user = useAuthStore((state) => state.user);
  const IDSube = user?.IDSube;
  const { eklentiTipleri, kesintiTipleri } = usePersonelSabitTanimlar();
  const tipler = tur === "eklenti" ? eklentiTipleri : kesintiTipleri;
  const { data: personelListesi = [], isLoading: isLoadingPersonel } =
    useAktifPersonelListesi(IDSube, !isEdit);

  const insertEklenti = useInsertEklenti();
  const updateEklenti = useUpdateEklenti();
  const insertKesinti = useInsertKesinti();
  const updateKesinti = useUpdateKesinti();
  const isSaving =
    insertEklenti.isPending ||
    updateEklenti.isPending ||
    insertKesinti.isPending ||
    updateKesinti.isPending;

  const { control, handleSubmit, setError } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      personeller: [],
      tip: params.tip ?? "",
      tutar: params.tutar ?? "",
      tarih: toFormTarih(params.tarih),
      net: params.net === "1",
    },
  });

  const personelOptions = useMemo(
    () =>
      personelListesi.map((p) => ({
        value: String(p.IDSubePersonel),
        label: p.AdSoyad,
        description: [p.SicilNo ? `Sicil: ${p.SicilNo}` : null, p.BolumAdi]
          .filter(Boolean)
          .join(" · "),
      })),
    [personelListesi],
  );

  const hata = (mesaj: string) => Alert.alert("Hata", mesaj);

  const onSubmit = async (values: FormValues) => {
    const tutar = Number(values.tutar);

    try {
      if (isEdit) {
        const result =
          tur === "eklenti"
            ? await updateEklenti.mutateAsync({
                IDSubePersonelYardim: params.id!,
                BordroOdemeTutari: tutar,
                OdemeTarihi: values.tarih,
                OdemeTipi: values.tip,
                Net: values.net,
              })
            : await updateKesinti.mutateAsync({
                IDSubePersonelOzelKesinti: params.id!,
                BordroKesintiTutari: tutar,
                KesintiTarihi: values.tarih,
                KesintiTipi: values.tip,
              });

        if (!isBasarili(result)) return hata(`${config.tekil} güncellenemedi.`);
        router.back();
        return;
      }

      if (values.personeller.length === 0) {
        setError("personeller", { message: "En az bir personel seçiniz" });
        return;
      }
      if (!IDSube) return hata("Kullanıcıya ait şube bilgisi bulunamadı.");

      const IDSubePersonel = values.personeller.join("-");
      const result =
        tur === "eklenti"
          ? await insertEklenti.mutateAsync({
              IDSube,
              IDSubePersonel,
              BordroOdemeTutari: tutar,
              OdemeTarihi: values.tarih,
              OdemeTipi: values.tip,
              Net: values.net,
            })
          : await insertKesinti.mutateAsync({
              IDSube,
              IDSubePersonel,
              BordroKesintiTutari: tutar,
              KesintiTarihi: values.tarih,
              KesintiTipi: values.tip,
            });

      if (!isBasarili(result)) return hata(`${config.tekil} oluşturulamadı.`);
      router.back();
    } catch (error) {
      hata(
        error instanceof Error
          ? error.message
          : `${config.tekil} ${isEdit ? "güncellenemedi" : "oluşturulamadı"}.`,
      );
    }
  };

  return (
    <ScrollView className="mt-4 p-6" keyboardShouldPersistTaps="handled">
      <View className="flex-row items-center justify-between">
        <Text className="text-lg font-semibold text-qrz-navy">
          {isEdit ? `${config.tekil} Düzenle` : `Yeni ${config.tekil}`}
        </Text>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <X size={22} color="#0f172a" />
        </Pressable>
      </View>
      <Text className="mt-1 text-xs text-slate-500">
        {isEdit
          ? `${config.tekil} kaydının bilgilerini güncelleyin.`
          : `Bir veya birden fazla personel seçerek ${config.tekil.toLocaleLowerCase("tr-TR")} kaydı oluşturun.`}
      </Text>

      <View className="mt-6 gap-4">
        {isEdit ? (
          <View className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <Text className="text-[11px] text-slate-500">Personel</Text>
            <Text className="text-sm font-semibold text-qrz-navy">{params.AdSoyad || "-"}</Text>
            {params.BolumAdi ? (
              <Text className="text-xs text-slate-500">{params.BolumAdi}</Text>
            ) : null}
          </View>
        ) : (
          <FormMultiSelect
            control={control}
            name="personeller"
            label="Personel"
            options={personelOptions}
            placeholder="Personel seçiniz"
            searchPlaceholder="İsim veya sicil no ile ara..."
            emptyMessage="Personel bulunamadı."
            isLoading={isLoadingPersonel}
            disabled={isSaving}
            required
          />
        )}

        <FormSelect
          control={control}
          name="tip"
          label={config.tipLabel}
          options={tipler}
          disabled={isSaving}
          required
        />

        <FormInput
          control={control}
          name="tutar"
          label="Tutar"
          placeholder={`${config.tekil} tutarı`}
          format="money"
          disabled={isSaving}
          required
        />

        <FormDatePicker
          control={control}
          name="tarih"
          label={config.tarihLabel}
          placeholder="Tarih seçin"
          disabled={isSaving}
          required
        />

        {config.netVar && (
          <FormSwitch control={control} name="net" label="Net" disabled={isSaving} />
        )}
      </View>

      <Pressable
        onPress={handleSubmit(onSubmit)}
        disabled={isSaving}
        className="mb-6 mt-6 items-center rounded-lg bg-qrz-navy py-3 disabled:opacity-50"
      >
        {isSaving ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-sm font-medium text-white">
            {isEdit ? "Güncelle" : "Kaydet"}
          </Text>
        )}
      </Pressable>
    </ScrollView>
  );
}
