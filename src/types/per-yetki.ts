// Admin panelindeki Ayarlar > Kurumsal Yönetim > Yetki Ayarları ekranından
// personel için açılıp kapatılan sayfa görünürlük bayrakları.
// DB bit alanları true/false veya 1/0 olarak gelebiliyor.
type DbBool = boolean | number;

export type PerYetkiType = {
  IDSirketSabit: string | number;
  IDSirket: string | number;
  PersonelPdksGorur: DbBool;
  PersonelPuantajGorur: DbBool;
  PersonelBordroGorur: DbBool;
  PersonelHerLokasyonuKullanabilir: DbBool;
};

export type PerYetkiKey =
  | "PersonelPdksGorur"
  | "PersonelPuantajGorur"
  | "PersonelBordroGorur";
