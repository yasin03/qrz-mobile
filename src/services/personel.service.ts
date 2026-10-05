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

export type AktifPersonel = {
  IDSubePersonel: string | number;
  AdSoyad: string;
  SicilNo?: string;
  BolumAdi?: string;
};

// Cevap bazen [[...]] (dataset) bazen [...] olarak dönebiliyor
function normalizeListResponse<T>(data: unknown): T[] {
  if (!Array.isArray(data) || data.length === 0) return [];
  const first = data[0];
  return Array.isArray(first) ? (first as T[]) : (data as T[]);
}

export async function getAktifPersonelListesi(params: {
  IDSube: string | number;
  Yil: string;
  Ay: string;
}): Promise<AktifPersonel[]> {
  const response = await api.post("/api/personel", {
    type: "GET_AKTIF_PERSONEL",
    TcKimlikNo: "",
    Adi: "",
    ...params,
  });
  return normalizeListResponse<AktifPersonel>(response.data);
}
