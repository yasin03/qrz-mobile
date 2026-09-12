export type PDKSSelectRequestType = {
  IDSubePersonel: string | number;
  Tarih1: string;
  Tarih2: string;
};

export type PDKSSelectResponseType = {
  IDSubePersonelSaat: string;
  IDSubePersonel: string;
  AdSoyad: string;
  Tarih: string;
  Giris: string;
  Cikis: string | null;
  NormalSure: string | null;
  MesaiSure: string | null;
  IzinSure: string | null;
  ToplamSure: string | null;
  Aciklama: string | null;
};

export type PDKSInsertInput = {
  IDSubePersonel: string | number;
  JsonData: string;
};
