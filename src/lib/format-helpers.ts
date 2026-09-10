export function formatTarih(value?: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  if (date.getUTCFullYear() <= 1900) return "-"; // sentinel "boş tarih" değeri
  const gun = String(date.getUTCDate()).padStart(2, "0");
  const ay = String(date.getUTCMonth() + 1).padStart(2, "0");
  const yil = date.getUTCFullYear();
  return `${gun}.${ay}.${yil}`;
}

export function formatBool(value?: boolean | null): string {
  if (value == null) return "-";
  return value ? "Evet" : "Hayır";
}

export function formatOrEmpty(value?: string | number | null): string {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}
