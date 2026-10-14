import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Location from "expo-location";
import { getDeviceId } from "@/lib/device";
import { api } from "@/lib/axios";
import {
  PDKSDetaySelectResponseType,
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
export const PDKS_QUERY_KEY = "pdks";

export function usePdksMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    // Yeni giriş/çıkış sonrası ana sayfa ve PDKS listesi güncel veriyi çeksin
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PDKS_QUERY_KEY] });
    },
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
    Yil: params.Yil,
    Ay: params.Ay,
  });

  return response.data;
}

// Personelin kendi aylık kayıtları
export function usePdksSelect(params: PDKSSelectRequestType, enabled = true) {
  return useQuery({
    queryKey: [PDKS_QUERY_KEY, params.Yil, params.Ay],
    queryFn: () => selectPdks(params),
    enabled: enabled && !!params.Yil && !!params.Ay,
  });
}

export function usePdksDetay(idSubePersonelSaat: string | number | null) {
  return useQuery({
    queryKey: [PDKS_QUERY_KEY, "detay", idSubePersonelSaat],
    queryFn: async () => {
      const response = await api.post<PDKSDetaySelectResponseType[]>(API_URL, {
        type: "SELECT_PDKS_DETAY",
        IDSubePersonelSaat: idSubePersonelSaat,
      });
      return response.data;
    },
    enabled: idSubePersonelSaat != null,
  });
}
