export const money = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

/** Нормализует ввод: запятая → точка, пробелы убираются */
export function normalizeDecimalInput(value: string) {
  return value.trim().replace(/\s+/g, "").replace(",", ".");
}

export function parseDecimal(value: string, fallback = 0): number {
  const normalized = normalizeDecimalInput(value);
  if (normalized === "" || normalized === "-" || normalized === ".") return fallback;
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) return fallback;
  return money(parsed);
}

export function parseOptionalDecimal(value: string): number | undefined {
  const normalized = normalizeDecimalInput(value);
  if (normalized === "") return undefined;
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) return undefined;
  return money(parsed);
}

export function formatDecimal(value: number | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) return "";
  const rounded = money(value);
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}
