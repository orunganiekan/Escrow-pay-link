import { formatNairaParts } from "@/lib/format";

interface NairaAmountProps {
  value: string | number;
  className?: string;
  symbolClassName?: string;
}

/**
 * Renders a Naira amount with the ₦ symbol in sans-serif (since JetBrains Mono
 * lacks a native ₦ glyph) and tabular monospace digits for clean alignment.
 */
export function NairaAmount({
  value,
  className = "",
  symbolClassName = "text-[#5F6368]",
}: NairaAmountProps) {
  const { symbol, digits } = formatNairaParts(value);
  return (
    <span className={`inline-flex items-baseline ${className}`}>
      <span
        className={`font-sans font-normal text-[0.76em] mr-[0.06em] ${symbolClassName}`}
      >
        {symbol}
      </span>
      <span className="font-mono tabular-nums">{digits}</span>
    </span>
  );
}
