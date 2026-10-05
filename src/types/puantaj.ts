export type PuantajSelectRequestType = {
  IDSube: string | number;
  IDBolum: string | number;
  Yil: string;
  Ay: string;
  Adi: string;
  TcKimlikNo: string;
};

export type PuantajSelectByIdRequestType = {
  IDSubePersonel: string | number;
  Yil: string;
  Ay: string;
};

type PuantajGunAlanlari = {
  [K in `G${number}`]: string | null;
};

export type PuantajSelectResponseType = PuantajGunAlanlari & {
  IDSubePersonel: string;
  IDSube: string;
  IDBolum: string;
  SicilNo: string;
  TcKimlikNo: string;
  Ad: string;
  Soyad: string;
  AdSoyad: string;
  Yil: string;
  Ay: string;
  BolumAdi: string;
  UnvanAdi: string;

  ToplamSaat: string | null;
  ToplamGun: string | null;
  ToplamHT: string | null;
  ToplamGT: string | null;
  ToplamYI: string | null;
  ToplamMI: string | null;
  ToplamFM: string | null;
  Bos: string | null;
};
