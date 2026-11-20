export const DELIVERY_WINDOW_PRESETS = [
  { minutes: 2, label: "2m (Test)", shortLabel: "2m Test" },
  { minutes: 1440, label: "24h", shortLabel: "24h" },
  { minutes: 2880, label: "48h", shortLabel: "48h" },
  { minutes: 4320, label: "72h", shortLabel: "72h" },
  { minutes: 10080, label: "7 days", shortLabel: "7 days" },
] as const;

export function formatDeliveryWindow(windowMinutes: number): string {
  const preset = DELIVERY_WINDOW_PRESETS.find((p) => p.minutes === windowMinutes);
  if (preset) return preset.shortLabel;
  if (windowMinutes < 60) return `${windowMinutes}m`;
  if (windowMinutes % 1440 === 0) {
    const days = windowMinutes / 1440;
    return days === 1 ? "24h" : `${days} days`;
  }
  return `${Math.round(windowMinutes / 60)}h`;
}

export function getAppUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(
    /\/+$/,
    ""
  );
}

export function buildWhatsAppShareUrl(
  productName: string,
  priceNgn: string | number,
  productUrl: string
): string {
  const text = `Pay safely for ${productName} (${formatNaira(priceNgn)}) using EscrowPay: ${productUrl}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

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
