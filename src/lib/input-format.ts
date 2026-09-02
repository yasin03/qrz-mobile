export type InputFormat =
  | "tcno"
  | "vergino"
  | "tel"
  | "number"
  | "text"
  | "money";

export function formatTel(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = digits.slice(1);
  digits = digits.slice(0, 10);

  const groups = [
    digits.slice(0, 3),
    digits.slice(3, 6),
    digits.slice(6, 8),
    digits.slice(8, 10),
  ].filter(Boolean);

  return groups.join(" ");
}

export function applyFormat(raw: string, format?: InputFormat): string {
  switch (format) {
    case "tcno":
      return raw.replace(/\D/g, "").slice(0, 11);
    case "vergino":
      return raw.replace(/\D/g, "").slice(0, 10);
    case "number":
      return raw.replace(/\D/g, "");
    case "text":
      return raw.replace(/[0-9]/g, "");
    case "tel":
      return formatTel(raw);
    default:
      return raw;
  }
}

export function formatMoneyDisplay(
  apiValue: string | number | undefined | null,
): string {
  if (apiValue === "" || apiValue === null || apiValue === undefined) return "";
  const [wholeRaw, decRaw = ""] = String(apiValue).split(".");
  const whole = wholeRaw.replace(/\D/g, "") || "0";
  const decimals = decRaw.replace(/\D/g, "").padEnd(2, "0").slice(0, 2);
  const groupedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${groupedWhole},${decimals}`;
}

export function applyMoneyFormat(raw: string): {
  display: string;
  api: string;
} {
  let cleaned = raw.replace(/[^\d,]/g, "");
  if (!cleaned) return { display: "", api: "" };

  const firstComma = cleaned.indexOf(",");
  if (firstComma !== -1) {
    cleaned =
      cleaned.slice(0, firstComma + 1) +
      cleaned.slice(firstComma + 1).replace(/,/g, "");
  }

  const hasComma = cleaned.includes(",");
  let [wholePart, decPart = ""] = cleaned.split(",");
  wholePart = wholePart.replace(/^0+(?=\d)/, "");
  decPart = decPart.slice(0, 2);

  const groupedWhole = (wholePart || "0").replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  const display = hasComma ? `${groupedWhole},${decPart}` : groupedWhole;
  const api = hasComma ? `${wholePart || "0"}.${decPart}` : wholePart || "";

  return { display, api };
}

export function padMoneyApiValue(api: string): string {
  if (!api) return "";
  const [whole, dec = ""] = api.split(".");
  return `${whole || "0"}.${dec.padEnd(2, "0").slice(0, 2)}`;
}
