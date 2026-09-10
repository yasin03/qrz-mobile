export type IzinKaydi = {
  IDSubePersonel: string;
  IDSube: string;
  IDBolum: string;
  SicilNo: string;
  TcKimlikNo: string;
  Ad: string;
  Soyad: string;
  IDIzinGenel: string;
  BaslangicTarihi: string;
  BitisTarihi: string;
  Aciklama: string;
  Gun: number;
  AitOlduguYil: string;
  IDSirket: string;
  SubeKodu: string;
  IseIlkGirisTarihi: string;
  IseSonGirisTarihi: string;
  Durum: boolean;
  CikisTarihi: string | null;
  BolumAdi: string;
};

export type IzinFiltre = {
  IDSube: string;
  IDSubePersonel: string; // yönetici/admin: "0", personel: kendi id'si
  BaslangicTarihi: string; // "yyyy-MM-dd"
  BitisTarihi: string;
  Aciklama: string; // "" ise tümü
};