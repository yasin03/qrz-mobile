import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AvansKaydi, AvansTalepKaydi } from "@/types/avans";
import { api } from "@/lib/axios";

type AvansFiltre = {
  IDSube: string;
  BaslangicTarihi: string;
  BitisTarihi: string;
};

type AvansTalepFiltre = {
  IDSube: string;
  IDSubePersonel: string;
  BaslangicTarihi: string;
  BitisTarihi: string;
};

type YeniAvansTalep = {
  IDSubePersonel: string;
  Tutar: number;
  TaksitSayisi: number;
  BordroKesintiTutari: number;
  Mesaj: string;
  OdemeBaslangicTarihi: string;
};

type AvansTalepGuncelle = {
  IDSubePersonelAvansTalep: string;
  IDKullanici: string;
  KabulRed: string; // "1" | "0"
  RedAciklama: string;
};

// Onaylanmış / ödenmiş avanslar
export function useAvanslar(filtre: AvansFiltre) {
  return useQuery({
    queryKey: ["avanslar", filtre],
    queryFn: () =>
      api
        .post<AvansKaydi[]>("/api/avans", { type: "SELECT_AVANS", ...filtre })
        .then((res) => res.data),
  });
}

export function useDeleteAvans() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (idIzinGenel: string) =>
      api.post("/api/avans", { type: "DELETE_AVANS", IDIzinGenel: idIzinGenel }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["avanslar"] });
    },
  });
}

// Avans talepleri
export function useAvansTalepleri(filtre: AvansTalepFiltre) {
  return useQuery({
    queryKey: ["avans-talepleri", filtre],
    queryFn: () =>
      api
        .post<AvansTalepKaydi[]>("/api/avans", { type: "SELECT_TALEP", ...filtre })
        .then((res) => res.data),
  });
}

export function useCreateAvansTalep() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: YeniAvansTalep) =>
      api.post("/api/avans", { type: "INSERT_TALEP", ...params }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["avans-talepleri"] });
    },
  });
}

export function useUpdateAvansTalep() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: AvansTalepGuncelle) =>
      api.post("/api/avans", { type: "UPDATE_TALEP", ...params }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["avans-talepleri"] });
      queryClient.invalidateQueries({ queryKey: ["avanslar"] });
    },
  });
}
