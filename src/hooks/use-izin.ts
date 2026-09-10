import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getIzinler, deleteIzin } from "@/services/izin.services";
import type { IzinFiltre } from "@/types/izin";

export const izinKeys = {
  all: ["izinler"] as const,
  list: (filtre: IzinFiltre) => [...izinKeys.all, "list", filtre] as const,
};

export function useIzinler(filtre: IzinFiltre) {
  return useQuery({
    queryKey: izinKeys.list(filtre),
    queryFn: () => getIzinler(filtre),
  });
}

export function useDeleteIzin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteIzin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: izinKeys.all });
    },
  });
}