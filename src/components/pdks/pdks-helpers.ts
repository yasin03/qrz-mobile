// Backend ISO tarihleri "Z" ile gönderiyor ama saat veritabanındaki yerel saat;
// Date'e çevirince +3 kaymasın diye string üzerinden parçalıyoruz.
const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/;
const TR_RE = /^(\d{2})\.(\d{2})\.(\d{4})/;

/** "yyyy-MM-dd" — ISO ("2026-10-12T...") veya "12.10.2026" kabul eder. */
export function toGunKey(value?: string | null): string | null {
  if (!value) return null;
  const iso = ISO_RE.exec(value);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const trDate = TR_RE.exec(value);
  if (trDate) return `${trDate[3]}-${trDate[2]}-${trDate[1]}`;
  return null;
}

export function bugunKey(): string {
  const now = new Date();
  const ay = String(now.getMonth() + 1).padStart(2, "0");
  const gun = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${ay}-${gun}`;
}

/** "12.10.2026" — tanınmayan formatı olduğu gibi döner. */
export function formatGun(value?: string | null): string {
  const key = toGunKey(value);
  if (!key) return value || "-";
  const [yil, ay, gun] = key.split("-");
  return `${gun}.${ay}.${yil}`;
}

/** ISO tarihten "HH:mm" */
export function formatSaat(value?: string | null): string {
  const iso = value ? ISO_RE.exec(value) : null;
  return iso?.[4] ? `${iso[4]}:${iso[5]}` : "-";
}

const ISO_FULL_RE = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/;
const SAAT_RE = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/;

/**
 * Tarih/saat değerini yerel Date'e çevirir ("Z" yok sayılır, saat kaymaz).
 * ISO ("2026-10-14T09:02:11.000Z") veya sadece saat ("09:02") kabul eder;
 * sadece saat verilirse `gun` (default bugün) tarihine oturtulur.
 */
export function parseYerelTarih(
  value?: string | null,
  gun: Date = new Date(),
): Date | null {
  if (!value) return null;
  const iso = ISO_FULL_RE.exec(value);
  if (iso) {
    const [, y, m, d, h, mi, s = "0"] = iso;
    return new Date(+y, +m - 1, +d, +h, +mi, +s);
  }
  const saat = SAAT_RE.exec(value.trim());
  if (saat) {
    const [, h, mi, s = "0"] = saat;
    return new Date(gun.getFullYear(), gun.getMonth(), gun.getDate(), +h, +mi, +s);
  }
  return null;
}

/** Süre (ms) → "07:12:05" */
export function formatSure(ms: number): string {
  const toplam = Math.max(0, Math.floor(ms / 1000));
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(Math.floor(toplam / 3600))}:${pad(Math.floor((toplam % 3600) / 60))}:${pad(toplam % 60)}`;
}

// Sayının okunuşunun son kelimesine göre ayrılma eki (bir-den, üç-ten, altı-dan, kırk-tan...)
const BIRLER_EKI: Record<number, string> = {
  1: "den", 2: "den", 3: "ten", 4: "ten", 5: "ten", 6: "dan", 7: "den", 8: "den", 9: "dan",
};
const ONLAR_EKI: Record<number, string> = {
  0: "dan", 1: "dan", 2: "den", 3: "dan", 4: "tan", 5: "den",
};

/** Date → "09:02'den", "09:30'dan", "18:45'ten" (okunuşa göre Türkçe ek) */
export function saatAyrilmaHali(date: Date): string {
  const h = date.getHours();
  const m = date.getMinutes();
  const pad = (n: number) => String(n).padStart(2, "0");
  // Dakika 00 ise saat okunur ("dokuz"), değilse dakika ("iki", "otuz")
  const sayi = m === 0 ? h : m;
  const ek = sayi % 10 ? BIRLER_EKI[sayi % 10] : ONLAR_EKI[Math.floor(sayi / 10)];
  return `${pad(h)}:${pad(m)}'${ek}`;
}

/** Date → "HH:mm" */
export function saatGosterim(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
