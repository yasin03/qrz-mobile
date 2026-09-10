import { startOfYear, format } from "date-fns";

export function getDefaultIzinTarihAraligi() {
  const now = new Date();
  return {
    BaslangicTarihi: format(startOfYear(now), "yyyy-MM-dd"),
    BitisTarihi: format(now, "yyyy-MM-dd"),
  };
}