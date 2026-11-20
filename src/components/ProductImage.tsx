"use client";

import { useState } from "react";

interface ProductImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  placeholderLabel?: string;
}

/**
 * Renders a remote product image URL with a clean Warm Editorial fallback
 * if no URL is provided or if loading fails.
 */
export function ProductImage({
  src,
  alt,
  className = "w-full h-full object-cover",
  placeholderLabel = "No product photo",
}: ProductImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const trimmed = src?.trim() || "";
  const showImage = Boolean(trimmed) && failedSrc !== trimmed;

  if (!showImage) {
    return (
      <div className="w-full h-full bg-[#F8F6F1] flex flex-col items-center justify-center gap-2 text-[#5F6368] px-4 text-center">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-60"
        >
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <circle cx="8.5" cy="10.5" r="1.5" />
          <path d="m21 15-5-5L5 19" />
        </svg>
        <span className="font-mono text-[11px] uppercase tracking-[0.06em] opacity-75">
          {placeholderLabel}
        </span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={trimmed}
      alt={alt}
      className={className}
      onError={() => setFailedSrc(trimmed)}
    />
  );
}
