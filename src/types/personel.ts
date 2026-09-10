export interface PersonelDetay {
  IDSubePersonel: string;
  IDSube: string;
  IDBolum: string;
  SicilNo: string;
  TcKimlikNo: string;
  Ad: string;
  Soyad: string;
  IlkSoyad: string;
  Cinsiyet: string;
  DogumTarihi: string;
  DogumYeri: string;
  MedeniDurum: string;
  Uyruk: string;
  KanGurubu: string;
  IseIlkGirisTarihi: string;
  IseSonGirisTarihi: string;
  IseSonGirisTarihi2: string;
  SgkDurumu: number;
  IstihdamDurumu: number;
  PersonelMeslekKodu: string;
  PersonelSgkBelgeTuru: string;
  PersonelKanunNo: string;
  PersonelGorevKodu: number;
  CalismaDurumu: number;
  Ucret: number;
  Ucret2: number;
  NetUcret: number;
  MaasParaBirimi: number;
  OdemeSekli: number;
  UcretTipi: number;
  OgrenimDurumu: number;
  MezuniyetYili: string;
  MezuniyetBolumu: string;
  IDBanka: number;
  BankaSubeKodu: string;
  BankaHesapNo: string;
  BankaIbanNo: string;
  IDLokasyon: string;
  CikisTarihi: string | null;
  Telefon: string;
  Adres: string;
  Aciklama: string;
  GorevAdi: string;
  UnvanAdi: string;
  Fotograf: string | null;
  Boy: number;
  Kilo: number;
  Yas: number;
  Durum: boolean;
  KullaniciAktif: boolean;
  IlKodu: string;
  IlceKodu: string;
  AsgeriUcretli: boolean;
  GunlukUcret: number;
  SaatlikUcret: number;
  AzCalismaDurumu: boolean;
  AzCalismaDurumuGunSayisi: number;
  // Backend'den gelen ama örnekte olmayan/az kullanılan alanlar için
  // aşağıdaki index signature tip güvenliğini bozmadan esneklik sağlar.
  [key: string]: unknown;
}

export interface PersonelDetayRequest {
  type: "GET_PERSONEL_DETAY";
  IDSubePersonel: string | number;
}