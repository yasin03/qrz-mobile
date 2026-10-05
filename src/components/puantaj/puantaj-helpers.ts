import { AY_DATA, HAFTA_DATA } from "@/constants/data";

export type PuantajBadge = {
  label: string;
  bgClassName: string;
  textClassName: string;
  /** Personel listesindeki aylık mini şerit için dolu renk */
  dotClassName: string;
};

const RENKLER = {
  gray: { bgClassName: "bg-slate-100", textClassName: "text-slate-700", dotClassName: "bg-emerald-400" },
  red: { bgClassName: "bg-red-50", textClassName: "text-red-600", dotClassName: "bg-red-400" },
  violet: { bgClassName: "bg-violet-50", textClassName: "text-violet-600", dotClassName: "bg-violet-400" },
  blue: { bgClassName: "bg-blue-50", textClassName: "text-blue-600", dotClassName: "bg-blue-400" },
  orange: { bgClassName: "bg-orange-50", textClassName: "text-orange-600", dotClassName: "bg-orange-400" },
  rose: { bgClassName: "bg-rose-100", textClassName: "text-rose-600", dotClassName: "bg-rose-600" },
  amber: { bgClassName: "bg-amber-50", textClassName: "text-amber-600", dotClassName: "bg-amber-400" },
};

const IZIN_KODLARI = ["YI", "CI", "EI", "DI", "MI", "SI", "GI", "SÜ"];
const UCRETSIZ_IZIN_KODLARI = ["19", "20", "21", "28", "29"];

function getRenk(code: string) {
  if (code === "HT") return RENKLER.red;
  if (code === "GT") return RENKLER.violet;
  if (IZIN_KODLARI.includes(code)) return RENKLER.blue;
  if (code === "01") return RENKLER.orange;
  if (code === "15") return RENKLER.rose;
  if (UCRETSIZ_IZIN_KODLARI.includes(code)) return RENKLER.amber;
  return RENKLER.gray;
}

export function getPuantajBadge(
  value: string | null | undefined,
): PuantajBadge | null {
  const code = value?.trim();
  if (!code) return null;
  return { label: code, ...getRenk(code) };
}

export function getHaftaBilgisi(yil: number, ay: number, gunNo: number) {
  const jsGun = new Date(yil, ay - 1, gunNo).getDay(); // Pazar=0 ... Cumartesi=6
  const haftaNo = jsGun === 0 ? 7 : jsGun; // Pazartesi=1 ... Pazar=7
  const hafta = HAFTA_DATA.find((item) => Number(item.value) === haftaNo);
  return {
    isWeekend: hafta?.isWeekend ?? false,
    shortDay: hafta?.shortTr ?? "",
    haftaNo,
  };
}

export function getAyAdi(ay: number) {
  return AY_DATA.find((item) => Number(item.value) === ay)?.label ?? "";
}

export const PUANTAJ_KOD_ACIKLAMALARI = [
  { kod: "7.5", label: "Normal Mesai (saat)", ...RENKLER.gray },
  { kod: "HT", label: "Hafta Tatili", ...RENKLER.red },
  { kod: "GT", label: "Genel Resmi Tatil", ...RENKLER.violet },
  { kod: "YI", label: "Yıllık İzin", ...RENKLER.blue },
  { kod: "MI", label: "Mazeret İzni", ...RENKLER.blue },
  { kod: "SI", label: "Saatlik İzin", ...RENKLER.blue },
  { kod: "EI", label: "Evlilik İzni", ...RENKLER.blue },
  { kod: "DI", label: "Doğum İzni", ...RENKLER.blue },
  { kod: "CI", label: "Cenaze İzni", ...RENKLER.blue },
  { kod: "GI", label: "Görev İzni", ...RENKLER.blue },
  { kod: "SÜ", label: "Süt İzni", ...RENKLER.blue },
  { kod: "01", label: "İstirahat", ...RENKLER.orange },
  { kod: "15", label: "Devamsızlık", ...RENKLER.rose },
];
