export type InputFormat =
  | "tcno"
  | "vergino"
  | "tel"
  | "number"
  | "text"
  | "money";

export function formatValue(format: InputFormat, value: string): string {
  const digits = value.replace(/\D/g, "");

  switch (format) {
    case "tcno":
      return digits.slice(0, 11);

    case "vergino":
      return digits.slice(0, 10);

    case "number":
      return digits;

    case "tel": {
      const d = digits.slice(0, 10); // 5xx xxx xx xx
      let out = "";
      if (d.length > 0) out += `(${d.slice(0, 3)}`;
      if (d.length >= 3) out += `) `;
      if (d.length > 3) out += d.slice(3, 6);
      if (d.length > 6) out += ` ${d.slice(6, 8)}`;
      if (d.length > 8) out += ` ${d.slice(8, 10)}`;
      return out;
    }

    case "money": {
      if (!digits) return "";
      return parseInt(digits, 10).toLocaleString("tr-TR");
    }

    case "text":
    default:
      return value;
  }
}

export function getKeyboardType(format: InputFormat) {
  switch (format) {
    case "tcno":
    case "vergino":
    case "number":
    case "tel":
    case "money":
      return "number-pad" as const;
    default:
      return "default" as const;
  }
}

export function getMaxLength(format: InputFormat): number | undefined {
  switch (format) {
    case "tcno":
      return 11;
    case "vergino":
      return 10;
    case "tel":
      return 15; // "(5xx) xxx xx xx"
    default:
      return undefined;
  }
}

// money formatındaki string'i tekrar sayıya çevirmek için (submit sırasında kullan)
export function parseFormattedNumber(
  format: InputFormat,
  value: string,
): string {
  if (
    format === "money" ||
    format === "number" ||
    format === "tcno" ||
    format === "vergino" ||
    format === "tel"
  ) {
    return value.replace(/\D/g, "");
  }
  return value;
}
