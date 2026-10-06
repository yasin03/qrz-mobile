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

export const formatMoney = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === "") {
    return "0,00";
  }

  return Number(value).toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Boş / sadece boşluk değerleri null'a çevirir
export const text = (value: unknown): string | null => {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  return str === "" ? null : str;
};

export const formatPhone = (value: unknown): string | null => {
  const str = text(value);
  if (!str) return null;
  const digits = str.replace(/\D/g, "");
  if (digits.length !== 10) return str;
  return `0${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 8)} ${digits.slice(8)}`;
};

export const formatIban = (value: unknown): string | null => {
  const str = text(value);
  return str
    ? str
        .replace(/\s/g, "")
        .replace(/(.{4})/g, "$1 ")
        .trim()
    : null;
};
