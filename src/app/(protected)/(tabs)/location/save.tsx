import { FormInput } from "@/components/form/form-input";
import { FormSelect } from "@/components/form/form-select";
import { FormSwitch } from "@/components/form/form-switch";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useBolumler } from "@/hooks/use-kurumsal";
import { useCreateLokasyon } from "@/hooks/use-lokasyonlar";
import { usePermissions } from "@/hooks/use-permissions";
import { ApiClientError } from "@/lib/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

const locationSchema = z.object({
  latitude: z.string().min(1, "Enlem alınamadı"),
  longitude: z.string().min(1, "Boylam alınamadı"),
  idBolum: z.string().min(1, "Bölüm seçilmedi"),
  locationName: z.string().min(1, "Konum adı girilmedi"),
  status: z.boolean(),
});

type LocationFormValues = z.infer<typeof locationSchema>;

const Save = () => {
  const router = useRouter();
  const { ensurePermissions } = usePermissions();
  const [isFetchingLocation, setIsFetchingLocation] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const createLokasyon = useCreateLokasyon();

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
      idBolum: "",
      latitude: "",
      longitude: "",
      locationName: "",
      status: true,
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
    createLokasyon.mutate(
      {
        IDBolum: Number(data.idBolum),
        LokasyonAdi: data.locationName,
        Enlem: Number(data.latitude),
        Boylam: Number(data.longitude),
        Aktif: data.status,
      },
      {
        onSuccess: () => {
          Alert.alert("Başarılı", "Konum kaydedildi.", [
            { text: "Tamam", onPress: () => router.back() },
          ]);
        },
        onError: (error) => {
          console.error("CREATE LOKASYON ERROR:", error);
          const message =
            error instanceof ApiClientError
              ? error.message
              : "Konum kaydedilirken bir hata oluştu.";
          Alert.alert("Hata", message);
        },
      },
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 gap-4 px-6 pt-4">
        <Text className="text-lg font-medium text-qrz-navy">Konum Kaydet</Text>

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
          disabled={isFetchingLocation || createLokasyon.isPending}
        >
          <Text>{createLokasyon.isPending ? "Kaydediliyor..." : "Kaydet"}</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
};

export default Save;
