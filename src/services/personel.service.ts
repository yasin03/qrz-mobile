import { api, ApiClientError } from "@/lib/axios";
import type { PersonelDetay } from "@/types/personel";

export async function getPersonelDetay(
  idSubePersonel: number,
): Promise<PersonelDetay> {
  const response = await api.post<PersonelDetay[]>("/api/personel", {
    type: "GET_PERSONEL_DETAY",
    IDSubePersonel: idSubePersonel,
  });

  const personel = response.data[0];

  if (!personel) {
    throw new ApiClientError("Personel bulunamadı", 404);
  }

  return personel;
}
