import { useEffect, useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { X } from "lucide-react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, differenceInCalendarDays } from "date-fns";

import { useAuthStore } from "@/stores/auth-store";
import { useInsertTalep, useIzinSure } from "@/hooks/use-izin";
import { usePersonelSabitTanimlar } from "@/hooks/use-sabit-tanimlar";
import { FormInput } from "@/components/form/form-input";
import { FormSelect } from "@/components/form/form-select";
import { FormDatePicker } from "@/components/form/form-date-picker";
import { cn } from "@/lib/utils";

const YILLIK_IZIN_KODU = "YI";

const izinTalepSchema = z
  .object({
    Aciklama: z.string().min(1, "İzin tipi seçiniz"),
    BaslangicTarihi: z.string().min(1, "Başlangıç tarihi seçiniz"),
    BitisTarihi: z.string().min(1, "Bitiş tarihi seçiniz"),
    Adres: z.string().min(1, "Adres giriniz"),
    Mesaj: z.string().optional(),
  })
  .refine((val) => val.BitisTarihi >= val.BaslangicTarihi, {
    message: "Bitiş tarihi başlangıçtan önce olamaz",
    path: ["BitisTarihi"],
  });

type IzinTalepFormValues = z.infer<typeof izinTalepSchema>;

export default function IzinEkle() {
  const user = useAuthStore((state) => state.user);
  const { izinTipleri } = usePersonelSabitTanimlar();
  const insertTalepMutation = useInsertTalep();

  const bugun = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);
  const { data: izinSure, isLoading: izinSureLoading } = useIzinSure(
    { IDSubePersonel: user?.IDSubePersonel ?? "", Tarih: bugun },
    !!user?.IDSubePersonel,
  );

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<IzinTalepFormValues>({
    resolver: zodResolver(izinTalepSchema),
    defaultValues: {
      Aciklama: "",
      BaslangicTarihi: bugun,
      BitisTarihi: bugun,
      Adres: "",
      Mesaj: "",
    },
  });

  const isYillikIzin = watch("Aciklama") === YILLIK_IZIN_KODU;
  const baslangic = watch("BaslangicTarihi");
  const bitis = watch("BitisTarihi");

  const gun = useMemo(() => {
    if (!baslangic || !bitis) return 0;
    const diff = differenceInCalendarDays(new Date(bitis), new Date(baslangic));
    return diff >= 0 ? diff + 1 : 0;
  }, [baslangic, bitis]);

  // İzin süresi sorgusundan gelen adresi forma bir kere doldur
  useEffect(() => {
    if (izinSure?.Adres) {
      setValue("Adres", izinSure.Adres, { shouldValidate: false });
    }
  }, [izinSure?.Adres, setValue]);

  const onSubmit = (values: IzinTalepFormValues) => {
    if (!user?.IDSubePersonel) return;
    const payload = {
      IDSubePersonel: user.IDSubePersonel,
      BaslangicTarihi: values.BaslangicTarihi,
      BitisTarihi: values.BitisTarihi,
      Gun: String(gun),
      Aciklama: values.Aciklama,
      AitOlduguYil: String(new Date(values.BaslangicTarihi).getFullYear()),
      Adres: values.Adres,
      Mesaj: values.Mesaj ?? "",
      Dosyalar: "",
    };

    insertTalepMutation.mutate(payload, {
      onSuccess: () => router.back(),
    });
  };

  return (
    <View className="bg-white p-6 pt-8">
      <View className="flex-row items-center justify-between">
        <Text className="text-lg font-semibold text-qrz-navy">
          Yeni İzin Talebi
        </Text>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <X size={22} color="#0f172a" />
        </Pressable>
      </View>

      <View className="mt-6 gap-4">
        <FormSelect
          control={control}
          name="Aciklama"
          label="İzin Tipi"
          options={izinTipleri ?? []}
        />

        {isYillikIzin && (
          <View className="gap-2 rounded-xl border border-slate-100 bg-slate-50 p-3">
            <Text className="text-sm font-semibold text-qrz-navy">
              Yıllık İzin Durumu
            </Text>

            {izinSureLoading ? (
              <ActivityIndicator size="small" color="#052346" className="py-3" />
            ) : izinSure ? (
              <View className="flex-row flex-wrap justify-between gap-y-2">
                <IzinStat label="Kıdem Yılı" value={izinSure.IzinKidemYili} />
                <IzinStat label="Toplam Hak" value={izinSure.ToplamIzinHakki} />
                <IzinStat label="Bu Yıl Kullanılan" value={izinSure.KullanilanIzin} />
                <IzinStat label="Geçmiş Yıl Kullanılan" value={izinSure.oKullanilanIzin} />
                <IzinStat label="Toplam Kullanılan" value={izinSure.ToplamKullanilanIzin} />
                <IzinStat label="Kalan İzin" value={izinSure.ToplamKalanIzin} highlight />
              </View>
            ) : (
              <Text className="text-sm text-slate-500">İzin bilgisi bulunamadı.</Text>
            )}
          </View>
        )}

        <View className="flex-row gap-3">
          <View className="flex-1">
            <FormDatePicker
              control={control}
              name="BaslangicTarihi"
              label="Başlangıç Tarihi"
              placeholder="Tarih seçin"
            />
          </View>
          <View className="flex-1">
            <FormDatePicker
              control={control}
              name="BitisTarihi"
              label="Bitiş Tarihi"
              placeholder="Tarih seçin"
            />
          </View>
        </View>

        <View>
          <Text className="mb-1 text-xs text-gray-500">Gün</Text>
          <View className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-3">
            <Text className="text-sm text-gray-700">{gun} gün</Text>
          </View>
        </View>

        <FormInput
          control={control}
          name="Adres"
          label="İzin Adresi"
          placeholder="İzin süresince ulaşılabilecek adres"
        />

        <FormInput
          control={control}
          name="Mesaj"
          label="Mesaj"
          type="textarea"
          placeholder="Açıklama (opsiyonel)"
        />
      </View>

      <Pressable
        onPress={handleSubmit(onSubmit)}
        disabled={insertTalepMutation.isPending}
        className="mb-6 mt-4 items-center rounded-lg bg-qrz-navy py-3 disabled:opacity-50"
      >
        {insertTalepMutation.isPending ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-sm font-medium text-white">Talebi Gönder</Text>
        )}
      </Pressable>
    </View>
  );
}

type IzinStatProps = {
  label: string;
  value: number | string | null | undefined;
  highlight?: boolean;
};

// Admin'deki TalepEkle ile aynı yıllık izin kutucuğu
function IzinStat({ label, value, highlight }: IzinStatProps) {
  return (
    <View
      className={cn(
        "w-[32%] rounded-lg border px-2.5 py-2",
        highlight ? "border-qrz-blue/40 bg-qrz-light" : "border-slate-200 bg-white",
      )}
    >
      <Text className="text-[11px] leading-tight text-slate-500" numberOfLines={2}>
        {label}
      </Text>
      <Text
        className={cn(
          "mt-0.5 text-base font-semibold",
          highlight ? "text-qrz-navy" : "text-slate-800",
        )}
      >
        {value ?? 0}
      </Text>
    </View>
  );
}
