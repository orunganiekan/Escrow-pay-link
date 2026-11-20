"use client";

import { useRef } from "react";

interface SixDigitCodeInputProps {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
}

/**
 * 6 tactile segmented digit boxes with auto-advance, backspace navigation,
 * arrow key navigation, and full 6-digit paste support.
 */
export function SixDigitCodeInput({
  value,
  onChange,
  disabled = false,
}: SixDigitCodeInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? "");

  function focusIndex(idx: number) {
    const clamped = Math.max(0, Math.min(5, idx));
    refs.current[clamped]?.focus();
    refs.current[clamped]?.select();
  }

  function handleChange(index: number, raw: string) {
    const cleaned = raw.replace(/\D/g, "");
    if (!cleaned) {
      const next = digits.slice();
      next[index] = "";
      onChange(next.join(""));
      return;
    }

    if (cleaned.length > 1) {
      const merged = cleaned.slice(0, 6);
      onChange(merged);
      focusIndex(Math.min(5, merged.length - 1));
      return;
    }

    const next = digits.slice();
    next[index] = cleaned;
    onChange(next.join(""));
    if (index < 5) {
      focusIndex(index + 1);
    }
  }

  function handleKeyDown(
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      e.preventDefault();
      const next = digits.slice();
      next[index - 1] = "";
      onChange(next.join(""));
      focusIndex(index - 1);
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      focusIndex(index - 1);
    } else if (e.key === "ArrowRight" && index < 5) {
      e.preventDefault();
      focusIndex(index + 1);
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    onChange(pasted);
    focusIndex(Math.min(5, pasted.length - 1));
  }

  return (
    <div
      className="flex items-center justify-center gap-2"
      role="group"
      aria-label="6-digit release code"
    >
      {digits.map((digit, index) => (
        <div key={index} className="flex items-center">
          {index === 3 ? (
            <span
              className="mx-1 text-[#5F6368]/60 font-mono text-[16px] select-none"
              aria-hidden="true"
            >
              –
            </span>
          ) : null}
          <input
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={6}
            disabled={disabled}
            aria-label={`Digit ${index + 1}`}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className="w-11 h-13 sm:w-12 sm:h-14 rounded-lg bg-[#F8F6F1] border border-[#E5E5E5] text-center font-mono text-[22px] font-medium text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] focus:bg-[#FFFFFF] disabled:opacity-50 transition-colors"
          />
        </div>
      ))}
    </div>
  );
}
