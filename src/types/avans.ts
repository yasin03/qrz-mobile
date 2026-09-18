export interface AvansKaydi {
  IDIzinGenel: string;
  IDSubePersonel: string;
  Ad: string;
  Soyad: string;
  SicilNo: string;
  BolumAdi: string;
  Tutar: number;
  TaksitSayisi: number;
  BordroKesintiTutari: number;
  Mesaj: string;
  OdemeBaslangicTarihi: string;
}

export type KabulRedDurumu = 0 | 1 | null; // null: bekliyor, 1: onaylandı, 0: reddedildi

export interface AvansTalepKaydi {
  IDSubePersonelAvansTalep: string;
  IDSubePersonel: string;
  Ad: string;
  Soyad: string;
  SicilNo: string;
  BolumAdi: string;
  Tutar: number;
  TaksitSayisi: number;
  BordroKesintiTutari: number;
  Mesaj: string;
  OdemeBaslangicTarihi: string;
  KabulRed: KabulRedDurumu;
  RedAciklama: string | null;
}
