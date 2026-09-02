import { api } from "@/lib/axios";
import { Lokasyon } from "@/types/lokasyon";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// SELECT LOKASYON
export async function selectLokasyonlar(idBolum: number): Promise<Lokasyon[]> {
  const response = await api.post<Lokasyon[]>("/api/lokasyon", {
    type: "SELECT_LOCATION",
    params: { IDBolum: idBolum },
  });
  return response.data;
}

export function useLokasyonlar(idBolum: number | undefined) {
  return useQuery({
    queryKey: ["lokasyonlar", idBolum],
    queryFn: () => selectLokasyonlar(idBolum as number),
    enabled: !!idBolum,
  });
}

// INSERT LOKASYON
export type InsertLokasyonInput = {
  IDBolum: number;
  LokasyonAdi: string;
  Enlem: number;
  Boylam: number;
  Aktif: boolean;
};

export async function insertLokasyon(input: InsertLokasyonInput) {
  const response = await api.post<Lokasyon[]>("/api/lokasyon", {
    type: "INSERT_LOCATION",
    params: input,
  });
  return response.data;
}

export function useCreateLokasyon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: InsertLokasyonInput) => insertLokasyon(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lokasyonlar"] });
    },
  });
}

// DELETE LOKASYON
export async function deleteLokasyon(idBolumLokasyon: string) {
  const response = await api.post<Lokasyon[]>("/api/lokasyon", {
    type: "DELETE_LOCATION",
    params: { IDBolumLokasyon: idBolumLokasyon },
  });
  return response.data;
}

export function useDeleteLokasyon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (idBolumLokasyon: string) => deleteLokasyon(idBolumLokasyon),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lokasyonlar"] });
    },
  });
}
