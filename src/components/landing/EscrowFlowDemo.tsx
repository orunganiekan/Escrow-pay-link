"use client";

import { useEffect, useState } from "react";
import { NairaAmount } from "@/components/NairaAmount";

const BEATS = [
  {
    id: 0,
    badge: "Funds Locked",
    badgeClass: "bg-[#FFF4D6] text-[#8A5A00]",
    title: "CE Ferulic Serum",
    meta: "72h delivery window · Held safely",
    rightLabel: "amount",
  },
  {
    id: 1,
    badge: "Release Code",
    badgeClass: "bg-[#F8F6F1] text-[#1A1A1A]",
    title: "Share at handoff",
    meta: "Only when the parcel is in your hands",
    rightLabel: "code",
  },
  {
    id: 2,
    badge: "Delivered & Released",
    badgeClass: "bg-[#EBF7EE] text-[#1E6B3A]",
    title: "Vela Skin credited",
    meta: "Confirmed with 6-digit release code",
    rightLabel: "released",
  },
] as const;

export function EscrowFlowDemo() {
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
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % BEATS.length);
    }, 3400);
    return () => clearInterval(timer);
  }, [paused]);

  const beat = BEATS[step] ?? BEATS[1];

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Editorial Lifestyle Photograph */}
      <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-[#F8F6F1]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/hero-editorial.jpg"
          alt="Hands untying a minimalist kraft-paper boutique parcel beside an amber skincare dropper bottle on a warm alabaster table"
          className="w-full h-full object-cover"
        />

        {/* Subtle bottom scrim for legibility of the receipt overlay */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#1A1A1A]/35 via-[#1A1A1A]/10 to-transparent"
          aria-hidden="true"
        />

        {/* Compact Floating Receipt Overlay */}
        <div className="absolute inset-x-3 bottom-3 sm:inset-x-5 sm:bottom-5">
          <div className="bg-[#FFFFFF]/95 backdrop-blur-sm rounded-xl p-3.5 sm:p-4 shadow-[0_12px_32px_rgba(26,26,26,0.14)]">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span
                  className={`inline-block font-mono text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-full transition-colors duration-300 ${beat.badgeClass}`}
                >
                  {beat.badge}
                </span>
                <p className="mt-1.5 text-[14px] sm:text-[15px] font-medium text-[#1A1A1A] truncate">
                  {beat.title}
                </p>
                <p className="text-[11px] sm:text-[12px] text-[#5F6368] truncate">
                  {beat.meta}
                </p>
              </div>

              <div className="shrink-0 text-right">
                {beat.rightLabel === "code" ? (
                  <p className="font-mono text-[18px] sm:text-[22px] font-medium tracking-[0.14em] text-[#1A1A1A]">
                    482 910
                  </p>
                ) : (
                  <p
                    className={`text-[18px] sm:text-[22px] font-medium ${
                      beat.rightLabel === "released"
                        ? "text-[#1E6B3A]"
                        : "text-[#1A1A1A]"
                    }`}
                  >
                    <NairaAmount
                      value={35000}
                      symbolClassName={
                        beat.rightLabel === "released"
                          ? "text-[#1E6B3A]/75"
                          : "text-[#5F6368]"
                      }
                    />
                  </p>
                )}

                {/* Subtle clickable progress dots */}
                <div className="mt-2 flex items-center justify-end gap-1.5">
                  {BEATS.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      aria-label={`Show step ${b.id + 1}: ${b.badge}`}
                      onClick={() => setStep(b.id)}
                      className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                        step === b.id
                          ? "w-5 bg-[#1A1A1A]"
                          : "w-1.5 bg-[#E5E5E5] hover:bg-[#5F6368]"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
