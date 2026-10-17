import { FormInput } from "@/components/form/form-input";
import { FormSelect } from "@/components/form/form-select";
import { FormSwitch } from "@/components/form/form-switch";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useBolumler } from "@/hooks/use-kurumsal";
import { useCreateLokasyon, useUpdateLokasyon } from "@/hooks/use-lokasyonlar";
import { usePermissions } from "@/hooks/use-permissions";
import { ApiClientError } from "@/lib/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { z } from "zod";

const locationSchema = z.object({
  latitude: z.string().min(1, "Enlem alınamadı"),
  longitude: z.string().min(1, "Boylam alınamadı"),
  idBolum: z.string().min(1, "Bölüm seçilmedi"),
  locationName: z.string().min(1, "Konum adı girilmedi"),
  status: z.boolean(),
});

type LocationFormValues = z.infer<typeof locationSchema>;

// Düzenleme modunda liste ekranından gelen parametreler (lokasyon-list-item).
// Enlem/boylam bilerek yok: düzenlemede de telefonun güncel konumu alınıyor.
type SaveParams = {
  idBolumLokasyon?: string;
  idBolum?: string;
  lokasyonAdi?: string;
  aktif?: string;
};

const Save = () => {
  const router = useRouter();
  const params = useLocalSearchParams<SaveParams>();
  const isEditMode = Boolean(params.idBolumLokasyon);
  const { ensurePermissions } = usePermissions();
  const [isFetchingLocation, setIsFetchingLocation] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const createLokasyon = useCreateLokasyon();
  const updateLokasyon = useUpdateLokasyon();
  const isSaving = createLokasyon.isPending || updateLokasyon.isPending;

  const {
    data: bolumler,
    isLoading: isBolumlerLoading,
    isError: isBolumlerError,
  } = useBolumler();
  const hasBolumler = (bolumler?.length ?? 0) > 0;
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      idBolum: params.idBolum ?? "",
      latitude: "",
      longitude: "",
      locationName: params.lokasyonAdi ?? "",
      status: params.aktif ? params.aktif === "1" : true,
    },
  });

  useEffect(() => {
    const fetchLocation = async () => {
      setIsFetchingLocation(true);
      setErrorMsg(null);

      const granted = await ensurePermissions();
      if (!granted) {
        setErrorMsg("Konum izni verilmedi");
        setIsFetchingLocation(false);
        return;
      }

      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setValue("latitude", location.coords.latitude.toString());
        setValue("longitude", location.coords.longitude.toString());
      } catch {
        setErrorMsg("Konum alınırken bir hata oluştu");
      } finally {
        setIsFetchingLocation(false);
      }
    };

    fetchLocation();
  }, []);

  const onSubmit = (data: LocationFormValues) => {
    const input = {
      IDBolum: Number(data.idBolum),
      LokasyonAdi: data.locationName,
      Enlem: Number(data.latitude),
      Boylam: Number(data.longitude),
      Aktif: data.status,
    };

    const callbacks = {
      onSuccess: () => {
        Alert.alert(
          "Başarılı",
          isEditMode ? "Konum güncellendi." : "Konum kaydedildi.",
          [{ text: "Tamam", onPress: () => router.back() }],
        );
      },
      onError: (error: Error) => {
        console.error("SAVE LOKASYON ERROR:", error);
        const message =
          error instanceof ApiClientError
            ? error.message
            : isEditMode
              ? "Konum güncellenirken bir hata oluştu."
              : "Konum kaydedilirken bir hata oluştu.";
        Alert.alert("Hata", message);
      },
    };

    if (isEditMode) {
      updateLokasyon.mutate(
        { ...input, IDBolumLokasyon: params.idBolumLokasyon as string },
        callbacks,
      );
    } else {
      createLokasyon.mutate(input, callbacks);
    }
  };

  return (
    // Klavye açılınca "Lokasyon Adı" input'u klavyenin üstüne kaydırılır (iOS + Android)
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: "#ffffff" }}
      contentContainerStyle={{
        gap: 16,
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 32,
      }}
      keyboardShouldPersistTaps="handled"
      bottomOffset={24}
    >
      <Text className="text-lg font-medium text-qrz-navy">
        {isEditMode ? "Konum Düzenle" : "Konum Kaydet"}
      </Text>

      {isFetchingLocation ? (
        <Text>Konum alınıyor...</Text>
      ) : errorMsg ? (
        <Text className="text-red-500">{errorMsg}</Text>
      ) : null}
      <FormSelect
        control={control}
        name="idBolum"
        label="Bölüm"
        vertical
        isLoading={isBolumlerLoading}
        options={
          bolumler?.map((b) => ({
            value: String(b.IDBolum),
            label: b.BolumAdi,
          })) ?? []
        }
      />

      <FormInput
        control={control}
        name="locationName"
        label="Lokasyon Adı"
        vertical
      />

      <FormSwitch control={control} name="status" label="Durum" vertical />

      <FormInput
        control={control}
        name="latitude"
        label="Enlem"
        disabled
        vertical
      />
      <FormInput
        control={control}
        name="longitude"
        label="Boylam"
        disabled
        vertical
      />

      <Button
        onPress={handleSubmit(onSubmit)}
        disabled={isFetchingLocation || isSaving}
      >
        <Text>{isSaving ? "Kaydediliyor..." : "Kaydet"}</Text>
      </Button>
    </KeyboardAwareScrollView>
  );
};

export default Save;
