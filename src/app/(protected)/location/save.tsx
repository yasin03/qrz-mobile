import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import { useBolumler } from "@/hooks/use-kurumsal";
import { usePermissions } from "@/hooks/use-permissions";
import { useAuthStore } from "@/stores/auth-store";
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
});

type LocationFormValues = z.infer<typeof locationSchema>;

const Save = () => {
  const router = useRouter();
  const { ensurePermissions } = usePermissions();
  const [isFetchingLocation, setIsFetchingLocation] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
    defaultValues: { idBolum: "", latitude: "", longitude: "" },
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
    Alert.alert(
      "Konum Bilgisi",
      `Bölüm ID: ${data.idBolum}\nEnlem: ${data.latitude}\nBoylam: ${data.longitude}`,
      [{ text: "Tamam", onPress: () => router.back() }],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 gap-4 px-6 pt-4">
        <Text className="text-lg font-medium text-qrz-navy">Konum Kaydet</Text>
        <Text className="text-lg font-medium text-qrz-navy">{bolumler && bolumler[0]?.BolumAdi}</Text>

        {isFetchingLocation ? (
          <Text>Konum alınıyor...</Text>
        ) : errorMsg ? (
          <Text className="text-red-500">{errorMsg}</Text>
        ) : null}

        <View className="gap-2">
          <Text className="text-sm font-medium text-qrz-navy">Bölüm</Text>
          <Controller
            control={control}
            name="idBolum"
            render={({ field: { value, onChange } }) => (
              <Select
                value={
                  value
                    ? {
                        value,
                        label:
                          bolumler?.find((b) => String(b.IDBolum) === value)
                            ?.BolumAdi ?? "",
                      }
                    : undefined
                }
                onValueChange={(option) => onChange(option?.value ?? "")}
              >
                <SelectTrigger
                 
                >
                  <SelectValue
                    placeholder={
                      !hasBolumler && isBolumlerLoading
                        ? "Bölümler yükleniyor..."
                        : !hasBolumler && isBolumlerError
                          ? "Bölümler yüklenemedi"
                          : "Bölüm seçiniz"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {bolumler?.map((bolum) => (
                    <SelectItem
                      key={bolum.IDBolum}
                      label={bolum.BolumAdi}
                      value={String(bolum.IDBolum)}
                    />
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.idBolum && (
            <Text className="text-xs text-red-500">
              {errors.idBolum.message}
            </Text>
          )}
        </View>

        <View className="gap-2">
          <Text className="text-sm font-medium text-qrz-navy">Enlem</Text>
          <Controller
            control={control}
            name="latitude"
            render={({ field: { value } }) => (
              <Input editable={false} value={value} placeholder="Enlem" />
            )}
          />
          {errors.latitude && (
            <Text className="text-xs text-red-500">
              {errors.latitude.message}
            </Text>
          )}
        </View>

        <View className="gap-2">
          <Text className="text-sm font-medium text-qrz-navy">Boylam</Text>
          <Controller
            control={control}
            name="longitude"
            render={({ field: { value } }) => (
              <Input editable={false} value={value} placeholder="Boylam" />
            )}
          />
          {errors.longitude && (
            <Text className="text-xs text-red-500">
              {errors.longitude.message}
            </Text>
          )}
        </View>

        <Button onPress={handleSubmit(onSubmit)} disabled={isFetchingLocation}>
          <Text>Kaydet</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
};

export default Save;
