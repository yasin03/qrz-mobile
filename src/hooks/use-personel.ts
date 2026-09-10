// hooks/usePersonelDetay.ts
import { useQuery } from "@tanstack/react-query";
import { getPersonelDetay } from "@/services/personel.service";

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
