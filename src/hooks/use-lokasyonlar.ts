import { api } from "@/lib/axios";
import { Lokasyon } from "@/types/lokasyon";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// SELECT LOKASYON
// idBolum boşsa ("Tümü") IDBolum hiç gönderilmiyor — route bu durumda
// "0" kullanıyor ve şubenin tüm bölümlerinin lokasyonları geliyor.
export async function selectLokasyonlar(idBolum?: string): Promise<Lokasyon[]> {
  const response = await api.post<Lokasyon[]>("/api/lokasyon", {
    type: "SELECT_LOKASYON",
    ...(idBolum ? { IDBolum: idBolum } : {}),
  });
  return response.data;
}

export function useLokasyonlar(idBolum: string = "") {
  return useQuery({
    queryKey: ["lokasyonlar", idBolum],
    queryFn: () => selectLokasyonlar(idBolum),
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
    type: "INSERT_LOKASYON",
    ...input,
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

// UPDATE LOKASYON
export type UpdateLokasyonInput = InsertLokasyonInput & {
  IDBolumLokasyon: string;
};

export async function updateLokasyon(input: UpdateLokasyonInput) {
  const response = await api.post<Lokasyon[]>("/api/lokasyon", {
    type: "UPDATE_LOKASYON",
    ...input,
  });
  return response.data;
}

export function useUpdateLokasyon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateLokasyonInput) => updateLokasyon(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lokasyonlar"] });
    },
  });
}

// DELETE LOKASYON
export async function deleteLokasyon(idBolumLokasyon: string) {
  const response = await api.post<Lokasyon[]>("/api/lokasyon", {
    type: "DELETE_LOKASYON",
    IDBolumLokasyon: idBolumLokasyon,
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
