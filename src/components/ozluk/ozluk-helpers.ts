import { differenceInMonths, format, isValid, parseISO } from "date-fns";
import { formatMoney, text } from "@/lib/format-helpers";

export type Option = { value: string; label: string };

// null → boş kabul edilir ("Boş alanları göster" kapalıyken gizlenir)
export type FieldValue = string | boolean | null;
export type OzlukField = { label: string; value: FieldValue };

// Bazı kodlarda "0" / "00000" / boş dize backend'in "seçilmedi" karşılığı.
const EMPTY_SENTINELS = new Set(["", "0", "00000"]);

export const code = (value: unknown): string | null => {
  const str = text(value);
  return str === null || EMPTY_SENTINELS.has(str) ? null : str;
};

export const lookup = (options: Option[], value: unknown): string | null => {
  const str = code(value);
  if (str === null) return null;
  return options.find((o) => o.value === str)?.label ?? str;
};

// Backend boş tarihleri 1900-01-01 olarak dönüyor.
export const toDate = (value: unknown): Date | null => {
  if (typeof value !== "string" || value === "") return null;
  const d = parseISO(value.replace("Z", ""));
  return isValid(d) && d.getFullYear() > 1900 ? d : null;
};

export const date = (value: unknown): string | null => {
  const d = toDate(value);
  return d ? format(d, "dd.MM.yyyy") : null;
};

export const money = (value: unknown): string | null => {
  if (value === null || value === undefined || Number(value) === 0) return null;
  return `${formatMoney(value as number)} ₺`;
};

export const num = (value: unknown, suffix = ""): string | null => {
  if (value === null || value === undefined || Number(value) === 0) return null;
  return `${value}${suffix}`;
};

export const kidem = (value: unknown): string | null => {
  const start = toDate(value);
  if (!start) return null;
  const months = differenceInMonths(new Date(), start);
  if (months < 0) return null;
  const yil = Math.floor(months / 12);
  const ay = months % 12;
  if (yil === 0 && ay === 0) return "1 aydan az";
  return [yil && `${yil} yıl`, ay && `${ay} ay`].filter(Boolean).join(" ");
};

export const initials = (ad: unknown, soyad: unknown) =>
  `${String(ad ?? "").trim()[0] ?? ""}${String(soyad ?? "").trim()[0] ?? ""}`.toLocaleUpperCase(
    "tr-TR",
  );

// Boolean alanlar "Hayır" ise de boş sayılır; sadece "Evet" olanlar öne çıksın.
export const getVisibleFields = (fields: OzlukField[], showEmpty: boolean) =>
  showEmpty ? fields : fields.filter((f) => f.value !== null && f.value !== false);
