import { api } from "@/lib/axios";
import type { IzinKaydi, IzinFiltre } from "@/types/izin";

export async function getIzinler(filtre: IzinFiltre) {
  const response = await api.post<IzinKaydi[]>("/api/izin", {
    type: "SELECT_IZIN",
    ...filtre,
  });
  return response.data; // interceptor zaten envelope'u soyduysa burada gerçek IzinKaydi[] olur
}

export async function deleteIzin(idIzinGenel: string) {
  const response = await api.post("/api/izin", {
    type: "DELETE_IZIN",
    IDIzinGenel: idIzinGenel,
  });
  return response.data;
}
