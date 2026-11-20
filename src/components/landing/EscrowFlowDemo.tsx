"use client";

import { useEffect, useState } from "react";
import { NairaAmount } from "@/components/NairaAmount";

const STEPS = [
  { id: 0, label: "Pay link", durationMs: 3200 },
  { id: 1, label: "Funds locked", durationMs: 3600 },
  { id: 2, label: "Released", durationMs: 3600 },
] as const;

export function EscrowFlowDemo() {
  // Default poster frame is beat 1 (Funds locked + release code), the clearest single frame
  const [step, setStep] = useState<number>(1);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const current = STEPS[step] ?? STEPS[0];
    const timer = setTimeout(() => {
      setStep((prev) => (prev + 1) % STEPS.length);
    }, current.durationMs);

    return () => clearTimeout(timer);
  }, [step, paused]);

  const isLink = step === 0;
  const isLocked = step === 1;
  const isReleased = step === 2;

  return (
    <div
      className="relative w-full max-w-[520px] mx-auto lg:ml-auto"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Main Product / Escrow Receipt Frame */}
      <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl shadow-[0_14px_40px_rgba(26,26,26,0.06)] overflow-hidden">
        {/* Minimal Window Header */}
        <div className="px-4 sm:px-5 h-11 sm:h-12 border-b border-[#E5E5E5] flex items-center justify-between gap-2 bg-[#FFFFFF]">
          <span className="text-[13px] font-semibold tracking-tight text-[#1A1A1A] shrink-0">
            EscrowPay
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-[#5F6368] truncate min-w-0">
            escrowpay.ng/p/vela-serum
          </span>
        </div>

        {/* Dynamic Body */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* Status Banner */}
          <div className="rounded-2xl bg-[#F8F6F1] border border-[#ECE8DF] p-3.5 sm:p-4 transition-all duration-300">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#5F6368]">
                ORDER #EPL-4829
              </span>

              <span
                className={`font-mono text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-full border transition-all duration-300 ${
                  isLink
                    ? "bg-[#F2F0EB] text-[#5F6368] border-[#E5E5E5]"
                    : isLocked
                      ? "bg-[#FFF4D6] text-[#8A5A00] border-[#FFB800]"
                      : "bg-[#EBF7EE] text-[#1E6B3A] border-[#BBF7D0]"
                }`}
              >
                {isLink
                  ? "72h Delivery Window"
                  : isLocked
                    ? "Funds Locked"
                    : "Delivered & Released"}
              </span>
            </div>

            <div className="mt-3 flex items-baseline justify-between gap-3">
              <p className="text-[15px] sm:text-[16px] font-medium text-[#1A1A1A] truncate min-w-0">
                CE Ferulic Serum
              </p>
              <p className="text-[18px] sm:text-[20px] font-medium text-[#1A1A1A] shrink-0">
                <NairaAmount value={35000} />
              </p>
            </div>

            {/* Progress Track */}
            <div className="mt-3 h-1 w-full rounded-full bg-[#E5E5E5] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${
                  isReleased ? "bg-[#1E6B3A]" : "bg-[#FFB800]"
                }`}
                style={{
                  width: isLink ? "28%" : isLocked ? "76%" : "100%",
                }}
              />
            </div>

            <p className="mt-2 font-mono text-[11px] text-[#5F6368]">
              {isLink
                ? "Vela Skin · 98% completed"
                : isLocked
                  ? "71h 58m left · Held safely until handoff"
                  : "Confirmed with 6-digit release code"}
            </p>
          </div>

          {/* Focal Action Area */}
          <div className="min-h-[118px] flex flex-col justify-center">
            {isLink ? (
              <div className="space-y-3 animate-fade-up">
                <div className="flex items-center justify-between text-[12px] text-[#5F6368] px-1">
                  <span>Zero-signup checkout</span>
                  <span className="font-mono text-[#1A1A1A]">Bank · Card · USSD</span>
                </div>
                <div className="h-11 rounded-full bg-[#1A1A1A] text-[#FFFFFF] text-[13px] font-medium flex items-center justify-center shadow-sm">
                  Pay ₦35,000 Safely →
                </div>
                <p className="text-center text-[11px] text-[#5F6368]">
                  Money locks in escrow until delivery is confirmed.
                </p>
              </div>
            ) : null}

            {isLocked ? (
              <div className="rounded-2xl border border-[#E5E5E5] bg-[#FFFFFF] p-4 text-center shadow-[0_6px_20px_rgba(26,26,26,0.05)] animate-fade-up">
                <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#5F6368]">
                  BUYER RELEASE CODE
                </p>
                <p className="mt-1.5 font-mono text-[26px] font-medium tracking-[0.2em] text-[#1A1A1A]">
                  482 910
                </p>
                <p className="mt-1 text-[11px] text-[#5F6368]">
                  Share only when your item arrives.
                </p>
              </div>
            ) : null}

            {isReleased ? (
              <div className="rounded-2xl border border-[#BBF7D0] bg-[#EBF7EE]/60 p-4 flex items-center justify-between gap-4 animate-fade-up">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#1E6B3A]">
                    SELLER AVAILABLE BALANCE
                  </p>
                  <p className="mt-1 text-[24px] font-medium text-[#1A1A1A]">
                    <NairaAmount value={35000} symbolClassName="text-[#1E6B3A]" />
                  </p>
                </div>
                <span className="w-10 h-10 rounded-full bg-[#1E6B3A] text-[#FFFFFF] flex items-center justify-center shrink-0">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m5 12 5 5L20 7" />
                  </svg>
                </span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Interactive Step Switcher Footer */}
        <div className="px-3 sm:px-5 py-2.5 sm:py-3 bg-[#FAF9F6] border-t border-[#E5E5E5] grid grid-cols-3 gap-1.5">
          {STEPS.map((s) => {
            const active = step === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setStep(s.id)}
                className={`h-7 px-1.5 rounded-full font-mono text-[10px] sm:text-[11px] truncate transition-colors cursor-pointer ${
                  active
                    ? "bg-[#1A1A1A] text-[#FFFFFF]"
                    : "text-[#5F6368] hover:text-[#1A1A1A]"
                }`}
              >
                {s.id + 1}. {s.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
