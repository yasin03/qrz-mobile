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
