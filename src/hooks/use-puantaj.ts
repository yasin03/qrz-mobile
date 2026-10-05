import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type {
  PuantajSelectByIdRequestType,
  PuantajSelectRequestType,
  PuantajSelectResponseType,
} from "@/types/puantaj";

// Şube / bölümdeki tüm personellerin aylık puantajı (yönetici / admin)
export function usePuantajList(
  params: PuantajSelectRequestType,
  enabled = true,
) {
  return useQuery({
    queryKey: [
      "puantaj-list",
      params.IDSube,
      params.IDBolum,
      params.Yil,
      params.Ay,
      params.Adi,
      params.TcKimlikNo,
    ],
    queryFn: () =>
      api
        .post<PuantajSelectResponseType[]>("/api/puantaj", {
          type: "SELECT_PUANTAJ",
          ...params,
        })
        .then((res) => res.data),
    staleTime: 5 * 60 * 1000,
    enabled,
  });
}

// Tek personelin aylık puantajı
export function usePuantajById(
  params: PuantajSelectByIdRequestType,
  enabled = true,
) {
  return useQuery({
    queryKey: ["puantaj", params.IDSubePersonel, params.Yil, params.Ay],
    queryFn: () =>
      api
        .post<PuantajSelectResponseType[]>("/api/puantaj", {
          type: "SELECT_PUANTAJ_BYID",
          ...params,
        })
        .then((res) => res.data),
    staleTime: 5 * 60 * 1000,
    enabled,
  });
}
