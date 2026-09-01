export type User = {
  Ad: string;
  IDKullaniciTip: "1" | "2" | "3";
  KullaniciTipi: string;
  IDGurup: string | null;
  IDSirket: string | null;
  IDSube: string | null;
  IDSubePersonel: string | null;
  IDKullanici: string;
  token: string;
};

export type LoginResponse = {
  Sonuc: "0" | "1" | "hata";
  Ad: string;
  IDKullaniciTip: "1" | "2" | "3";
  KullaniciTipi: string;
  IDGurup: string | null;
  IDSirket: string | null;
  IDSube: string | null;
  IDSubePersonel: string | null;
  IDKullanici: string;
  token?: string | null;
};

export type LoginRequest = {
  username: string;
  password: string;
};
