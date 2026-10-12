// SELECT_PDKS_KENDI - IDSubePersonel backend'de session'dan alınır
export type PDKSSelectRequestType = {
  Yil: string;
  /** "01".."12" */
  Ay: string;
};

export type PDKSSelectResponseType = {
  IDSubePersonelSaat: string;
  IDSubePersonel: string;
  Tarih: string;
  Giris: string | null;
  Cikis: string | null;
  NormalSure: string | null;
  MesaiSure: string | null;
  IzinSure: string | null;
  ToplamSure: string | null;
};

// SELECT_PDKS_DETAY - bir günün tüm giriş/çıkış hareketleri
export type PDKSDetaySelectResponseType = {
  IDBolumLokasyon: string | number;
  LokasyonAdi: string | null;
  Enlem: string | null;
  Boylam: string | null;
  Yon: string;
  /** ISO, ör. "2026-10-10T17:16:18.117Z" (saat veritabanındaki yerel saat) */
  Tarih: string;
};

export type PDKSInsertInput = {
  IDSubePersonel: string | number;
  JsonData: string;
};

export type PdksYon = "Giriş" | "Çıkış";
