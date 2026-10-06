import { useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import {
  BadgeCheck,
  Briefcase,
  CalendarDays,
  Contact,
  GraduationCap,
  Hash,
  HeartPulse,
  IdCard,
  Landmark,
  Phone,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Wallet,
  type LucideIcon,
} from "lucide-react-native";

import { usePersonelDetay } from "@/hooks/use-personel";
import { useIlceler, useIller } from "@/hooks/use-il-ilce-vergi-data";
import { usePersonelSabitTanimlar, useSabitTanimlar } from "@/hooks/use-sabit-tanimlar";
import { formatIban, formatPhone, text } from "@/lib/format-helpers";
import { cn } from "@/lib/utils";
import {
  code,
  date,
  getVisibleFields,
  initials,
  kidem,
  lookup,
  money,
  num,
  type OzlukField,
} from "./ozluk-helpers";
import { OzlukFiltreSheet } from "./OzlukFiltreSheet";
import { BilgiBolumu } from "@/components/bilgi-bolumu";

type Props = {
  idSubePersonel: string | number;
  /** Yönetici görünümü: bordro parametreleri de gösterilir. */
  isAdminView?: boolean;
};

type Group = { key: string; title: string; icon: LucideIcon; fields: OzlukField[] };

const PRIMARY = "#052346";

// Personelin özlük bilgileri: profil kartı + özet + gruplu bilgi kartları + görünüm filtresi
export function OzlukBilgileri({ idSubePersonel, isAdminView = false }: Props) {
  const [showEmpty, setShowEmpty] = useState(false);
  const [hiddenGroups, setHiddenGroups] = useState<Set<string>>(() => new Set());
  const [filtreOpen, setFiltreOpen] = useState(false);

  const toggleGroup = (key: string, visible: boolean) =>
    setHiddenGroups((prev) => {
      const next = new Set(prev);
      if (visible) next.delete(key);
      else next.add(key);
      return next;
    });

  const { data: p, isLoading, isError, isRefetching, refetch } =
    usePersonelDetay(idSubePersonel);

  const {
    sgkDurumlari,
    istihdamDurumlari,
    ucretTipleri,
    odemeSekilleri,
    maasParaBirimleri,
    calismaDurumlari,
    ogrenimDurumlari,
    medeniDurumlar,
    kanGruplari,
    uyruklar,
    ozurlulukDurumlari,
  } = useSabitTanimlar();
  const { sgkBelgeTurleri, sigortaKollari, sgkKanunNolar, gorevKodlari } =
    usePersonelSabitTanimlar();

  const ilKodu = code(p?.IlKodu) ?? undefined;
  const { data: iller = [] } = useIller();
  const { data: ilceler = [] } = useIlceler(ilKodu);

  if (isLoading) {
    return (
      <View className="items-center py-16">
        <ActivityIndicator color={PRIMARY} />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="m-4 rounded-2xl border border-red-100 bg-red-50 p-4">
        <Text className="text-sm text-red-600">Özlük bilgileri yüklenirken bir hata oluştu.</Text>
      </View>
    );
  }

  if (!p) {
    return (
      <View className="m-4 rounded-2xl border border-slate-100 bg-white p-6">
        <Text className="text-center text-sm text-slate-500">Personel bilgisi bulunamadı.</Text>
      </View>
    );
  }

  const adSoyad = [p.Ad, p.Soyad].filter(Boolean).join(" ").trim() || "-";
  const unvan = code(p.UnvanAdi) ?? code(p.GorevAdi);
  // API kodları bazen sayı (453), bazen başında 0 olan metin ("034") dönüyor
  const ilceKodu = code(p.IlceKodu);
  const ilAdi = ilKodu
    ? (iller.find((il) => Number(il.IlKodu) === Number(ilKodu))?.IlAdi ?? ilKodu)
    : null;
  const ilceAdi = ilceKodu
    ? (ilceler.find((ilce) => Number(ilce.IlceKodu) === Number(ilceKodu))?.IlceAdi ?? ilceKodu)
    : null;
  const cinsiyet =
    p.Cinsiyet === "KADIN" ? "Kadın" : p.Cinsiyet === "ERKEK" ? "Erkek" : text(p.Cinsiyet);
  const ucretTipi = lookup(ucretTipleri, p.UcretTipi);
  const cikisTarihi = date(p.CikisTarihi);
  const telefon = formatPhone(p.Telefon);
  const aktif = Boolean(p.Durum) && !cikisTarihi;

  const summary: { label: string; value: string; icon: LucideIcon }[] = [
    { label: "Sicil No", value: text(p.SicilNo) ?? "-", icon: Hash },
    { label: "İşe Giriş", value: date(p.IseSonGirisTarihi) ?? "-", icon: CalendarDays },
    { label: "Kıdem", value: kidem(p.IseSonGirisTarihi) ?? "-", icon: BadgeCheck },
    {
      label: ucretTipi ? `Ücret (${ucretTipi})` : "Ücret",
      value: money(p.Ucret) ?? "-",
      icon: Wallet,
    },
  ];

  const groups: Group[] = [
    {
      key: "kimlik",
      title: "Kimlik Bilgileri",
      icon: IdCard,
      fields: [
        { label: "TC Kimlik No", value: text(p.TcKimlikNo) },
        { label: "Ad", value: text(p.Ad) },
        { label: "Soyad", value: text(p.Soyad) },
        { label: "İlk Soyad", value: text(p.IlkSoyad) },
        { label: "Cinsiyet", value: cinsiyet },
        { label: "Doğum Tarihi", value: date(p.DogumTarihi) },
        { label: "Doğum Yeri", value: text(p.DogumYeri) },
        { label: "Yaş", value: num(p.Yas) },
        { label: "Medeni Durum", value: lookup(medeniDurumlar, p.MedeniDurum) },
        { label: "Uyruk", value: lookup(uyruklar, p.Uyruk) },
        { label: "Kimlik Kartı Seri No", value: text(p.KimlikKartiSeriNo) },
        { label: "Kimlik Düzenleme Tarihi", value: date(p.KimlikKartiDuzenlemeTarihi) },
        { label: "Kimlik Bitiş Tarihi", value: date(p.KimlikKartiBitisTarihi) },
      ],
    },
    {
      key: "iletisim",
      title: "İletişim Bilgileri",
      icon: Contact,
      fields: [
        { label: "Telefon", value: telefon },
        { label: "İl", value: ilAdi },
        { label: "İlçe", value: ilceAdi },
        { label: "Adres", value: text(p.Adres) },
      ],
    },
    {
      key: "is",
      title: "İş Bilgileri",
      icon: Briefcase,
      fields: [
        { label: "Görev", value: code(p.GorevAdi) },
        { label: "Unvan", value: code(p.UnvanAdi) },
        { label: "Çalışma Alanı", value: text(p.CalismaAlani) },
        { label: "Koordinatörlük", value: text(p.Koordinatorluk) },
        { label: "Çalışma Durumu", value: lookup(calismaDurumlari, p.CalismaDurumu) },
        { label: "İstihdam Durumu", value: lookup(istihdamDurumlari, p.IstihdamDurumu) },
        { label: "İlk Sigorta Başlangıç", value: date(p.IseIlkGirisTarihi) },
        { label: "İşe Giriş Tarihi", value: date(p.IseSonGirisTarihi) },
        { label: "Çıkış Tarihi", value: cikisTarihi },
        { label: "Ayrılış Kodu", value: code(p.PersonelAyrilisKodu) },
        { label: "Geçmişten Kalan İzin", value: num(p.GecmistenKalanIzinGun, " gün") },
      ],
    },
    {
      key: "sgk",
      title: "SGK Bilgileri",
      icon: ShieldCheck,
      fields: [
        { label: "SGK Durumu", value: lookup(sgkDurumlari, p.SgkDurumu) },
        { label: "SGK Belge Türü", value: lookup(sgkBelgeTurleri, p.PersonelSgkBelgeTuru) },
        { label: "SGK Kanun No", value: lookup(sgkKanunNolar, p.PersonelKanunNo) },
        { label: "Görev Kodu", value: lookup(gorevKodlari, p.PersonelGorevKodu) },
        { label: "Meslek Kodu", value: code(p.PersonelMeslekKodu) },
        { label: "Sigorta Kolu", value: lookup(sigortaKollari, p.PersonelSigortaKolu) },
        { label: "İşkur Kaydı", value: Boolean(p.IskurKayit) },
        { label: "İşkur Kayıt No", value: text(p.IskurKayitNo) },
        { label: "Sendika Üyesi", value: Boolean(p.SendikaDurumu) },
        { label: "Sendika Başlangıç", value: date(p.SendikaBaslangicTarihi) },
        { label: "Dayanışma", value: Boolean(p.DayanismaDurumu) },
        { label: "Dayanışma Başlangıç", value: date(p.DayanismaBaslangicTarihi) },
      ],
    },
    {
      key: "ucret",
      title: "Ücret Bilgileri",
      icon: Wallet,
      fields: [
        { label: "Ücret Tipi", value: ucretTipi },
        { label: "Ödeme Şekli", value: lookup(odemeSekilleri, p.OdemeSekli) },
        { label: "Para Birimi", value: lookup(maasParaBirimleri, p.MaasParaBirimi) },
        { label: "Ücret", value: money(p.Ucret) },
        { label: "Net Ücret", value: money(p.NetUcret) },
        { label: "Günlük Ücret", value: money(p.GunlukUcret) },
        { label: "Saatlik Ücret", value: money(p.SaatlikUcret) },
        { label: "Sözleşme Ücreti", value: money(p.SozlesmeUcret) },
        { label: "Sözleşme Ücreti 2", value: money(p.SozlesmeUcret2) },
        { label: "Ücret Ödeme Günü", value: num(p.UcretOdemeGun) },
        { label: "Asgari Ücretli", value: Boolean(p.AsgeriUcretli) },
      ],
    },
    {
      key: "egitim",
      title: "Eğitim Bilgileri",
      icon: GraduationCap,
      fields: [
        { label: "Öğrenim Durumu", value: lookup(ogrenimDurumlari, p.OgrenimDurumu) },
        { label: "Mezuniyet Yılı", value: code(p.MezuniyetYili) },
        { label: "Mezuniyet Bölümü", value: text(p.MezuniyetBolumu) },
      ],
    },
    {
      key: "banka",
      title: "Banka Bilgileri",
      icon: Landmark,
      fields: [
        { label: "Banka", value: code(p.IDBanka) },
        { label: "Şube Kodu", value: code(p.BankaSubeKodu) },
        { label: "Hesap No", value: text(p.BankaHesapNo) },
        { label: "IBAN", value: formatIban(p.BankaIbanNo) },
      ],
    },
    {
      key: "saglik",
      title: "Sağlık ve Diğer Bilgiler",
      icon: HeartPulse,
      fields: [
        { label: "Kan Grubu", value: lookup(kanGruplari, p.KanGurubu) },
        { label: "Boy", value: num(p.Boy, " cm") },
        { label: "Kilo", value: num(p.Kilo, " kg") },
        { label: "Engellilik Durumu", value: Boolean(p.OzurluDurumu) },
        { label: "Engellilik Derecesi", value: lookup(ozurlulukDurumlari, p.OzurlulukDerecesi) },
        { label: "Eski Hükümlü", value: Boolean(p.EskiHukumluDurumu) },
      ],
    },
  ];

  if (isAdminView) {
    groups.push({
      key: "parametre",
      title: "Bordro Parametreleri",
      icon: Settings2,
      fields: [
        { label: "Ücret 2", value: money(p.Ucret2) },
        { label: "Günlük Ücret 2", value: money(p.GunlukUcret2) },
        { label: "Saatlik Ücret 2", value: money(p.SaatlikUcret2) },
        { label: "Sözleşme Ödeme Şekli", value: lookup(odemeSekilleri, p.SozlesmeOdemeSekli) },
        { label: "Sözleşme Ödeme Şekli 2", value: lookup(odemeSekilleri, p.SozlesmeOdemeSekli2) },
        { label: "AGİ Oranı", value: num(p.AgiOrani, "%") },
        { label: "BES Oranı", value: num(p.BesOrani, "%") },
        { label: "Teşvik Oranı", value: num(p.TesvikOrani, "%") },
        { label: "Kümülatif SGK Matrahı", value: money(p.KumulatifSgkMatrahi) },
        { label: "Devreden SGK Matrahı", value: money(p.DevredenSgkMatrahi) },
        { label: "A.Ü. Küm. Vergi Matrahı", value: money(p.AuKumulatifVergiMatrahi) },
        { label: "Az Çalışma", value: Boolean(p.AzCalismaDurumu) },
        { label: "Az Çalışma Gün Sayısı", value: num(p.AzCalismaDurumuGunSayisi) },
        { label: "İstisna Durum Bilgisi", value: text(p.IstisnaDurumBilgi) },
        { label: "İstisna Durum Tarihi", value: date(p.IstisnaDurumTarih) },
        { label: "AGİ Almaz", value: Boolean(p.AgiAlmazDurumu) },
        { label: "BES Kesilmez", value: Boolean(p.BesKesilmezDurumu) },
        { label: "Vergiden Muaf", value: Boolean(p.VergidenMuaf) },
        { label: "Yardım Hariç", value: Boolean(p.YardimHaric) },
        { label: "AGİ Hariç", value: Boolean(p.AgiHaric) },
        { label: "Mali Mesuliyet", value: Boolean(p.MaliMesuliyet) },
        { label: "Çocuk Yardımı Alamaz", value: Boolean(p.CocukYardimiAlamaz) },
        { label: "Bordro İstisna Uygulama", value: Boolean(p.BordroIstisnaUygulama) },
        { label: "Ücret Otomatik İşle", value: Boolean(p.UcretOtomatikIsle) },
        { label: "Hastalık Risk Primi", value: Boolean(p.HastalikRiskPrimDurumu) },
        { label: "Kullanıcı Aktif", value: Boolean(p.KullaniciAktif) },
        { label: "Özel Kod", value: text(p.OzelKod) },
        { label: "Özel Kod 2", value: text(p.OzelKod2) },
        { label: "Açıklama", value: text(p.Aciklama) },
      ],
    });
  }

  const visibleGroups = groups
    .filter((group) => !hiddenGroups.has(group.key))
    .map((group) => ({ ...group, fields: getVisibleFields(group.fields, showEmpty) }))
    .filter((group) => group.fields.length > 0);

  const filtreAktif = showEmpty || hiddenGroups.size > 0;

  return (
    <>
      <ScrollView
        contentContainerClassName="gap-3 p-4"
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      >
        {/* Profil kartı */}
        <View className="rounded-2xl border border-slate-100 bg-white p-4">
          <View className="flex-row items-center gap-4">
            <View className="h-14 w-14 items-center justify-center rounded-full bg-qrz-light">
              <Text className="text-lg font-bold text-qrz-navy">
                {initials(p.Ad, p.Soyad) || "?"}
              </Text>
            </View>
            <View className="flex-1 gap-1">
              <Text className="text-lg font-bold text-qrz-navy" numberOfLines={1}>
                {adSoyad}
              </Text>
              {unvan ? (
                <Text className="text-sm text-slate-500" numberOfLines={1}>
                  {unvan}
                </Text>
              ) : null}
            </View>
          </View>

          <View className="mt-3 flex-row flex-wrap gap-1.5">
            <View className={cn("rounded-md px-2 py-0.5", aktif ? "bg-green-50" : "bg-slate-100")}>
              <Text className={cn("text-xs font-semibold", aktif ? "text-green-700" : "text-slate-500")}>
                {aktif ? "Aktif" : "Pasif"}
              </Text>
            </View>
            {cinsiyet ? (
              <View className="rounded-md bg-slate-100 px-2 py-0.5">
                <Text className="text-xs font-medium text-slate-600">{cinsiyet}</Text>
              </View>
            ) : null}
            {num(p.Yas) ? (
              <View className="rounded-md bg-slate-100 px-2 py-0.5">
                <Text className="text-xs font-medium text-slate-600">{p.Yas} yaş</Text>
              </View>
            ) : null}
            {cikisTarihi ? (
              <View className="rounded-md bg-red-50 px-2 py-0.5">
                <Text className="text-xs font-semibold text-red-600">Çıkış: {cikisTarihi}</Text>
              </View>
            ) : null}
          </View>

          <View className="mt-3 flex-row items-center gap-2 border-t border-slate-100 pt-3">
            {telefon ? (
              <Pressable
                onPress={() => Linking.openURL(`tel:${String(p.Telefon).replace(/\D/g, "")}`)}
                className="h-10 flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-slate-50"
              >
                <Phone size={16} color={PRIMARY} />
                <Text className="text-sm font-medium text-qrz-navy">{telefon}</Text>
              </Pressable>
            ) : (
              <View className="flex-1" />
            )}
            <Pressable
              onPress={() => setFiltreOpen(true)}
              accessibilityLabel="Görünüm filtresi"
              className={cn(
                "h-10 flex-row items-center gap-1.5 rounded-xl border px-3",
                filtreAktif ? "border-qrz-navy bg-qrz-light" : "border-slate-200 bg-white",
              )}
            >
              <SlidersHorizontal size={16} color={PRIMARY} />
              <Text className="text-sm font-medium text-qrz-navy">Filtre</Text>
            </Pressable>
          </View>
        </View>

        {/* Özet */}
        <View className="flex-row flex-wrap justify-between">
          {summary.map(({ label, value, icon: Icon }) => (
            <View
              key={label}
              className="mb-2 w-[49%] gap-1 rounded-2xl border border-qrz-blue/20 bg-qrz-light p-3"
            >
              <View className="flex-row items-center gap-1.5">
                <Icon size={13} color={PRIMARY} />
                <Text className="flex-1 text-[11px] uppercase text-slate-500" numberOfLines={1}>
                  {label}
                </Text>
              </View>
              <Text className="text-base font-bold text-qrz-navy" numberOfLines={1}>
                {value}
              </Text>
            </View>
          ))}
        </View>

        {/* Gruplar */}
        {visibleGroups.map((group) => (
          <BilgiBolumu
            key={group.key}
            title={group.title}
            icon={group.icon}
            fields={group.fields}
          />
        ))}

        {visibleGroups.length === 0 && (
          <View className="rounded-2xl border border-dashed border-slate-200 bg-white p-6">
            <Text className="text-center text-sm text-slate-500">
              Filtreye uygun bilgi bulunamadı.
            </Text>
          </View>
        )}
      </ScrollView>

      <OzlukFiltreSheet
        visible={filtreOpen}
        onClose={() => setFiltreOpen(false)}
        showEmpty={showEmpty}
        onShowEmptyChange={setShowEmpty}
        groups={groups.map(({ key, title }) => ({ key, title }))}
        hiddenGroups={hiddenGroups}
        onToggleGroup={toggleGroup}
        onShowAll={() => setHiddenGroups(new Set())}
      />
    </>
  );
}
