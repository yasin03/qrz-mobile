import { useMutation, useQuery } from "@tanstack/react-query";
import * as Location from "expo-location";
import { getDeviceId } from "@/lib/device";
import { api } from "@/lib/axios";
import {
  PDKSSelectRequestType,
  PDKSSelectResponseType,
  PdksYon,
} from "@/types/pdks";

type PdksRequest = {
  type: "INSERT_PDKS_KENDI";
  JsonData: string;
  Yon: PdksYon;
};

// test: 1 → kayıt oluşturuldu, 0 → kayıt reddedildi (ör. bugün zaten giriş var)
export type PdksResponse = {
  test: number;
  sonuc: string;
};

type PdksMutationParams = {
  idBolum: number;
  idBolumLokasyon: number;
  position: Location.LocationObject;
  yon: PdksYon;
};

const API_URL = "/api/pdks";

export function usePdksMutation() {
  return useMutation({
    mutationFn: async ({
      idBolum,
      idBolumLokasyon,
      position,
      yon,
    }: PdksMutationParams): Promise<PdksResponse> => {
      const idDevice = await getDeviceId();
      const { coords, timestamp } = position;
      const data = {
        idBolum,
        idBolumLokasyon,
        idDevice,
        latitude: coords.latitude,
        longitude: coords.longitude,
        timestamp,
        accuracy: coords.accuracy,
        altitude: coords.altitude,
        altitudeAccuracy: coords.altitudeAccuracy,
      };
      const body: PdksRequest = {
        type: "INSERT_PDKS_KENDI",
        JsonData: JSON.stringify(data),
        Yon: yon,
      };
      const response = await api.post<PdksResponse | PdksResponse[]>(
        API_URL,
        body,
      );

      // Prosedür sonucu tek satırlık dizi olarak gelebilir
      const result = Array.isArray(response.data)
        ? response.data[0]
        : response.data;

      if (!result || typeof result.test === "undefined") {
        throw new Error("PDKS_INVALID_RESPONSE");
      }

      return { test: Number(result.test), sonuc: String(result.sonuc ?? "") };
    },
  });
}

export async function selectPdks(
  params: PDKSSelectRequestType,
): Promise<PDKSSelectResponseType[]> {
  const response = await api.post<PDKSSelectResponseType[]>(API_URL, {
    type: "SELECT_PDKS_KENDI",
    IDSubePersonel: params.IDSubePersonel,
    Tarih1: params.Tarih1,
    Tarih2: params.Tarih2,
  });

  return response.data;
}

export function usePdksSelect(
  IDSubePersonel: number,
  Tarih1: string,
  Tarih2: string,
) {
  return useQuery({
    queryKey: ["pdks", IDSubePersonel, Tarih1, Tarih2],

    queryFn: () =>
      selectPdks({
        IDSubePersonel,
        Tarih1,
        Tarih2,
      }),

    enabled: !!IDSubePersonel && !!Tarih1 && !!Tarih2,
  });
}
