import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Location from "expo-location";
import * as Crypto from "expo-crypto";
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

export type PdksGonderParams = {
  idBolum: number;
  idBolumLokasyon: number;
  position: Location.LocationObject;
  yon: PdksYon;
  /** Aynı okutmanın tekrar gönderimlerinde sabit kalan kimlik (ileride idempotency için) */
  istekId?: string;
  /** Kayıt cihazdaki kuyruktan sonradan gönderiliyorsa true */
  cevrimdisi?: boolean;
};

const API_URL = "/api/pdks";
export const PDKS_QUERY_KEY = "pdks";

// Prosedür sonucu { test, sonuc }, [{ test, sonuc }] ya da iç içe dizi ([[{...}]])
// olarak gelebilir; test alanı olan ilk satırı bulur
function pdksSonucunuBul(data: unknown): PdksResponse | null {
  if (Array.isArray(data)) {
    for (const item of data) {
      const found = pdksSonucunuBul(item);
      if (found) return found;
    }
    return null;
  }
  if (data && typeof data === "object" && "test" in data) {
    return data as PdksResponse;
  }
  return null;
}

/**
 * Kendi PDKS kaydını gönderir. Hem okutma ekranı (mutation) hem bekleyen kayıt
 * kuyruğu bu fonksiyonu kullanır. Saat, okutma anındaki position.timestamp'tir.
 */
export async function pdksGonder({
  idBolum,
  idBolumLokasyon,
  position,
  yon,
  istekId,
  cevrimdisi = false,
}: PdksGonderParams): Promise<PdksResponse> {
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
    istekId: istekId ?? Crypto.randomUUID(),
    cevrimdisi: cevrimdisi ? 1 : 0,
  };
  const body: PdksRequest = {
    type: "INSERT_PDKS_KENDI",
    JsonData: JSON.stringify(data),
    Yon: yon,
  };
  const response = await api.post<unknown>(API_URL, body);

  const result = pdksSonucunuBul(response.data);

  if (!result) {
    throw new Error("PDKS_INVALID_RESPONSE");
  }

  return { test: Number(result.test), sonuc: String(result.sonuc ?? "") };
}

export function usePdksMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    // Yeni giriş/çıkış sonrası ana sayfa ve PDKS listesi güncel veriyi çeksin
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PDKS_QUERY_KEY] });
    },
    mutationFn: pdksGonder,
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
