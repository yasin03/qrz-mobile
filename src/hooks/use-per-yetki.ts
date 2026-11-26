import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { AppState } from "react-native";
import { api } from "@/lib/axios";
import { useRole } from "@/hooks/use-role";
import type { PerYetkiKey, PerYetkiType } from "@/types/per-yetki";

const ENDPOINT = "/api/ayarlar/per-yetki";
export const QUERY_KEY = "per-yetki";

/** Bayatsa yeniden çeker; devam eden istek varsa yenisini atmaz, ona katılır. */
function yetkileriTazele(
  queryClient: ReturnType<typeof useQueryClient>,
  sadeceBayatsa = true,
) {
  return queryClient.refetchQueries(
    { queryKey: [QUERY_KEY], stale: sadeceBayatsa ? true : undefined },
    { cancelRefetch: false },
  );
}

/** Şirketin personel yetki ayarları (IDSirket token'dan). */
export function usePerYetki(enabled = true) {
  const query = useQuery({
    queryKey: [QUERY_KEY],
    queryFn: async () => {
      const { data } = await api.post<PerYetkiType[] | PerYetkiType>(
        ENDPOINT,
        { type: "SELECT_PERYETKI" },
      );
      return (Array.isArray(data) ? data[0] : data) ?? null;
    },
    enabled,
    // Admin web'den değiştirdiğinde hızlı yansısın diye kısa tutuluyor;
    // ekran açılışlarında 30 sn'den eskiyse yeniden çekilir.
    staleTime: 30 * 1000,
  });

  // RN'de "pencereye odaklanınca yenile" kendiliğinden çalışmıyor; uygulama
  // arka plandan öne gelince yetkileri tazele. Hook birden çok yerde (menü,
  // dashboard, sayfa guard'ları) kullanıldığı için her biri ayrı istek atmasın:
  // sadece bayatsa (staleTime) ve devam eden istek varsa ona katılarak.
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!enabled) return;
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") yetkileriTazele(queryClient);
    });
    return () => sub.remove();
  }, [enabled, queryClient]);

  return query;
}

/**
 * Personel rolü için sayfa yetkilerini döner. Admin/Yönetici için sorgu
 * atılmaz ve her yetki true kabul edilir.
 *
 *   const { can, isLoading } = usePersonelYetki();
 *   if (!can("PersonelPdksGorur")) ...
 */
export function usePersonelYetki() {
  const { isPersonel } = useRole();
  const queryClient = useQueryClient();
  const { data, isLoading } = usePerYetki(isPersonel);

  const can = (key: PerYetkiKey) => !isPersonel || Boolean(data?.[key]);

  return {
    can,
    isLoading: isPersonel && isLoading,
    /** Yetkileri hemen yeniden çeker (admin için no-op). */
    refresh: () => {
      if (isPersonel) yetkileriTazele(queryClient, false);
    },
  };
}
