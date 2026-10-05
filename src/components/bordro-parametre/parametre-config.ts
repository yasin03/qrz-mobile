import { format } from "date-fns";
import type { Href } from "expo-router";
import { MinusCircle, PlusCircle, type LucideIcon } from "lucide-react-native";
import type {
  EklentiResponseType,
  KesintiResponseType,
} from "@/types/bordro-parametre";

export type ParametreTur = "eklenti" | "kesinti";

/** Eklenti ve kesinti kayıtlarının ekranda kullanılan ortak hali */
export type ParametreKaydi = {
  id: string;
  IDSubePersonel: string;
  AdSoyad: string;
  BolumAdi: string;
  tarih: string; // API'den gelen ham tarih
  tutar: number;
  tipKod: string;
  tipAdi: string;
  /** Sadece eklentide var */
  net?: boolean;
};

export type ParametreFiltre = {
  Tarih1: string; // yyyy-MM-dd
  Tarih2: string; // yyyy-MM-dd
  Tip: string; // "ALL" = tümü
  Net: "ALL" | "NET" | "BRUT"; // sadece eklenti
};

type ParametreConfig = {
  baslik: string;
  personelBaslik: string;
  tekil: string;
  tarihLabel: string;
  tipLabel: string;
  renk: string;
  isaret: "+" | "−";
  icon: LucideIcon;
  ekleHref: Href;
  netVar: boolean;
};

export const PARAMETRE_CONFIG: Record<ParametreTur, ParametreConfig> = {
  eklenti: {
    baslik: "Eklentiler",
    personelBaslik: "Eklentilerim",
    tekil: "Eklenti",
    tarihLabel: "Ödeme Tarihi",
    tipLabel: "Eklenti Tipi",
    renk: "#10B981",
    isaret: "+",
    icon: PlusCircle,
    ekleHref: "/eklentiler/ekle" as Href,
    netVar: true,
  },
  kesinti: {
    baslik: "Kesintiler",
    personelBaslik: "Kesintilerim",
    tekil: "Kesinti",
    tarihLabel: "Kesinti Tarihi",
    tipLabel: "Kesinti Tipi",
    renk: "#EF4444",
    isaret: "−",
    icon: MinusCircle,
    ekleHref: "/kesintiler/ekle" as Href,
    netVar: false,
  },
};

export function eklentiToKayit(row: EklentiResponseType): ParametreKaydi {
  return {
    id: String(row.IDSubePersonelYardim),
    IDSubePersonel: String(row.IDSubePersonel),
    AdSoyad: row.AdSoyad,
    BolumAdi: row.BolumAdi,
    tarih: row.OdemeTarihi,
    tutar: Number(row.BordroOdemeTutari) || 0,
    tipKod: String(row.OdemeTipi ?? ""),
    tipAdi: row.OdemeTipi2,
    net: Boolean(row.Net),
  };
}

export function kesintiToKayit(row: KesintiResponseType): ParametreKaydi {
  return {
    id: String(row.IDSubePersonelOzelKesinti),
    IDSubePersonel: String(row.IDSubePersonel),
    AdSoyad: row.AdSoyad,
    BolumAdi: row.BolumAdi,
    tarih: row.KesintiTarihi,
    tutar: Number(row.BordroKesintiTutari) || 0,
    tipKod: String(row.KesintiTipi ?? ""),
    tipAdi: row.KesintiTipi2,
  };
}

// Admin'deki gibi varsayılan aralık: yıl başından bugüne
export function getDefaultParametreFiltre(): ParametreFiltre {
  const now = new Date();
  return {
    Tarih1: format(new Date(now.getFullYear(), 0, 1), "yyyy-MM-dd"),
    Tarih2: format(now, "yyyy-MM-dd"),
    Tip: "ALL",
    Net: "ALL",
  };
}
