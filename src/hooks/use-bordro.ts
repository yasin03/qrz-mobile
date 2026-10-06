import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type {
  BordroResponseType,
  BordroSelectByIdRequestType,
  BordroSelectRequestType,
} from "@/types/bordro";

const ENDPOINT = "/api/bordro";
export const QUERY_KEY = "bordro-list";

// Şubedeki tüm personellerin aylık bordrosu (yönetici / admin)
export function useBordroList(params: BordroSelectRequestType, enabled = true) {
  return useQuery({
    queryKey: [
      QUERY_KEY,
      params.IDSube,
      params.IDBolum,
      params.Yil,
      params.Ay,
      params.Adi,
      params.TcKimlikNo,
    ],
    queryFn: async () => {
      const { data } = await api.post<BordroResponseType[]>(ENDPOINT, {
        type: "SELECT_BORDRO",
        ...params,
      });
      return data ?? [];
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 dakika
  });
}

// Tek personelin aylık bordrosu
export function useBordroById(
  params: BordroSelectByIdRequestType,
  enabled = true,
) {
  return useQuery({
    queryKey: [QUERY_KEY, params.IDSubePersonel, params.Yil, params.Ay],
    queryFn: async () => {
      const { data } = await api.post<BordroResponseType[]>(ENDPOINT, {
        type: "SELECT_BORDRO_BYID",
        ...params,
      });
      return data;
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 dakika
  });
}
