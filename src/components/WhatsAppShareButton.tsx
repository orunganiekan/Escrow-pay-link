interface WhatsAppShareButtonProps {
  href: string;
  variant?: "primary" | "outline";
  className?: string;
}

export function WhatsAppShareButton({
  href,
  variant = "outline",
  className = "",
}: WhatsAppShareButtonProps) {
  const base =
    variant === "primary"
      ? "h-11 px-6 bg-[#1A1A1A] border border-[#1A1A1A] text-[#FFFFFF] text-[14px]"
      : "h-9 px-3 bg-[#FFFFFF] border border-[#E5E5E5] text-[#1A1A1A] text-[13px]";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`rounded-full font-medium inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors hover:bg-[#25D366]/12 hover:border-[#25D366]/45 hover:text-[#15803D] active:bg-[#25D366]/12 active:border-[#25D366]/45 active:text-[#15803D] ${base} ${className}`}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <path
          d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9.4 8.6c.2-.3.5-.5.8-.5h.4c.2 0 .4.1.5.4l.7 1.5c.1.2 0 .4-.1.6l-.5.6c.6 1 1.4 1.8 2.4 2.4l.6-.5c.2-.1.4-.2.6-.1l1.5.7c.3.1.4.3.4.5v.4c0 .3-.2.6-.5.8-.6.4-1.6.6-3.1-.1-1.7-.8-3.4-2.5-4.2-4.2-.7-1.5-.5-2.5-.1-3.1Z"
          fill="currentColor"
        />
      </svg>
      <span>Share to WhatsApp</span>
    </a>
  );
}
