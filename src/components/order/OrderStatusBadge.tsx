export function OrderStatusBadge({
  status,
  variant = "buyer",
}: {
  status: string;
  variant?: "buyer" | "seller";
}) {
  switch (status) {
    case "PENDING_PAYMENT":
      return (
        <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-[#F2F0EB] text-[#5F6368] border border-[#E5E5E5] whitespace-nowrap">
          Awaiting Payment
        </span>
      );
    case "PROCESSING_PAYMENT":
      return (
        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-[#FFF4D6] text-[#8A5A00] border border-[#FFB800]/60 whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FFB800] animate-pulse" />
          Confirming Payment…
        </span>
      );
    case "SECURED":
      return (
        <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-[#FFF4D6] text-[#8A5A00] border border-[#FFB800] whitespace-nowrap">
          {variant === "seller"
            ? "Payment Secured — Ship Now"
            : "Funds Locked in Escrow"}
        </span>
      );
    case "SHIPPED":
      return (
        <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-[#EEF4FF] text-[#1E40AF] border border-[#BFDBFE] whitespace-nowrap">
          Shipped — In Transit
        </span>
      );
    case "RELEASED":
      return (
        <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-[#EBF7EE] text-[#1E6B3A] border border-[#BBF7D0] whitespace-nowrap">
          Delivered &amp; Released
        </span>
      );
    case "REFUNDED":
      return (
        <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-[#F2F0EB] text-[#5F6368] border border-[#E5E5E5] whitespace-nowrap">
          Refunded
        </span>
      );
    case "DISPUTED":
      return (
        <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-[#FDECEC] text-[#B42318] border border-[#FECACA] whitespace-nowrap">
          Disputed — Frozen
        </span>
      );
    default:
      return (
        <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-[#F2F0EB] text-[#5F6368] border border-[#E5E5E5] whitespace-nowrap">
          {status}
        </span>
      );
  }
}
