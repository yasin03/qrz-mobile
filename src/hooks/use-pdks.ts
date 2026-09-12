import { useMutation, useQuery } from "@tanstack/react-query";
import * as Location from "expo-location";
import { getDeviceId } from "@/lib/device";
import { api } from "@/lib/axios";
import { PDKSSelectRequestType, PDKSSelectResponseType } from "@/types/pdks";

type PdksJsonData = {
  idBolum: number;
  idBolumLokasyon: number;
  idDevice: string;
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy: number | null;
  altitude: number | null;
  altitudeAccuracy: number | null;
};

type PdksRequest = {
  type: "INSERT_PDKS";
  params: {
    jsonData: PdksJsonData;
  };
};

type PdksResponse = {
  message?: string;
  durum?: string; // backend "GIRIS" | "CIKIS" gibi bir alan dönebilir
};

type PdksMutationParams = {
  idBolum: number;
  idBolumLokasyon: number;
  position: Location.LocationObject;
};

export function usePdksMutation() {
  return useMutation({
    mutationFn: async ({
      idBolum,
      idBolumLokasyon,
      position,
    }: PdksMutationParams): Promise<PdksResponse> => {
      const idDevice = await getDeviceId();
      const { coords, timestamp } = position;

      const body: PdksRequest = {
        type: "INSERT_PDKS",
        params: {
          jsonData: {
            idBolum,
            idBolumLokasyon,
            idDevice,
            latitude: coords.latitude,
            longitude: coords.longitude,
            timestamp,
            accuracy: coords.accuracy,
            altitude: coords.altitude,
            altitudeAccuracy: coords.altitudeAccuracy,
          },
        },
      };

      const response = await api.post<PdksResponse>("/api/pdks", body);
      return response.data as PdksResponse;
    },
  });
}

export async function selectPdks(
  params: PDKSSelectRequestType,
): Promise<PDKSSelectResponseType[]> {
  const response = await api.post<PDKSSelectResponseType[]>("/api/pdks", {
    type: "SELECT_PDKS",
    params,
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
