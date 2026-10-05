// hooks/usePersonelDetay.ts
import { useQuery } from "@tanstack/react-query";
import {
  getAktifPersonelListesi,
  getPersonelDetay,
} from "@/services/personel.service";

export function usePersonelDetay(
  idSubePersonel: string | number | null | undefined,
) {
  const id = idSubePersonel != null ? Number(idSubePersonel) : undefined;

  return useQuery({
    queryKey: ["personel-detay", id],
    queryFn: () => getPersonelDetay(id as number),
    enabled: id != null && !Number.isNaN(id),
  });
}

// Şubedeki aktif personeller (eklenti / kesinti eklerken personel seçimi için)
export function useAktifPersonelListesi(
  IDSube: string | number | null | undefined,
  enabled = true,
) {
  const now = new Date();
  const Yil = String(now.getFullYear());
  const Ay = String(now.getMonth() + 1).padStart(2, "0");

  return useQuery({
    queryKey: ["personel", "aktif", IDSube, Yil, Ay],
    queryFn: () => getAktifPersonelListesi({ IDSube: IDSube ?? "", Yil, Ay }),
    enabled: enabled && Boolean(IDSube),
    staleTime: 5 * 60 * 1000,
  });
}
