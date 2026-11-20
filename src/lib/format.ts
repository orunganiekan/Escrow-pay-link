export function formatNairaParts(amount: string | number): {
  symbol: string;
  digits: string;
} {
  const num = typeof amount === "number" ? amount : Number(amount);
  if (!Number.isFinite(num)) return { symbol: "₦", digits: "0" };
  const hasDecimals = Math.abs(num % 1) > 0.0001;
  const digits = new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: hasDecimals ? 2 : 0,
  }).format(num);
  return { symbol: "₦", digits };
}

/**
 * Formats a Naira amount (string or number) with ₦ prefix and grouping separators.
 * Shows decimals only when fractional kobo are present.
 */
export function formatNaira(amount: string | number): string {
  const { symbol, digits } = formatNairaParts(amount);
  return `${symbol}${digits}`;
}
