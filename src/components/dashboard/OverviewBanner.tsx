"use client";

import { useEffect, useState } from "react";
import { NairaAmount } from "@/components/NairaAmount";
import { WithdrawModal } from "./WithdrawModal";

interface OverviewBannerProps {
  availableBalanceNgn: string;
  inEscrowNgn: number;
  completedCount: number;
  disputedCount: number;
}

export function OverviewBanner({
  availableBalanceNgn,
  inEscrowNgn,
  completedCount,
  disputedCount,
}: OverviewBannerProps) {
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const targetBalance = Number(availableBalanceNgn) || 0;
  const [displayedBalance, setDisplayedBalance] = useState(targetBalance);

  useEffect(() => {
    if (targetBalance <= 0) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const durationMs = 520;
    const start = performance.now();
    let frameId = 0;

    function tick(now: number) {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayedBalance(Math.round(targetBalance * eased));
      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      } else {
        setDisplayedBalance(targetBalance);
      }
    }

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [targetBalance]);

  const totalResolved = completedCount + disputedCount;
  const completionLabel =
    totalResolved > 0
      ? `${Math.round((completedCount / totalResolved) * 100)}% Completion Rate`
      : "New Seller";

  return (
    <>
      <section className="bg-[#F8F6F1] border border-[#ECE8DF] rounded-xl p-6 sm:p-7 flex items-center justify-between gap-6 animate-fade-up">
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start gap-6 sm:gap-10">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5F6368]">
                AVAILABLE BALANCE
              </p>
              <p className="mt-1.5 text-[28px] sm:text-[32px] font-medium tracking-[-0.02em] text-[#1A1A1A]">
                <NairaAmount value={displayedBalance} />
              </p>
            </div>

            <div className="sm:pl-10 sm:border-l sm:border-[#E6E1D6]">
              <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#8A5A00]">
                IN ESCROW
              </p>
              <p className="mt-1.5 text-[28px] sm:text-[32px] font-medium tracking-[-0.02em] text-[#1A1A1A]">
                <NairaAmount value={inEscrowNgn} />
              </p>
            </div>
          </div>

          <p className="mt-4 text-[13px] text-[#5F6368]">
            {completedCount} Completed · {disputedCount} Disputed ·{" "}
            <span className="text-[#1A1A1A] font-medium">{completionLabel}</span>
          </p>

          <div className="mt-5">
            <button
              type="button"
              onClick={() => setWithdrawOpen(true)}
              className="h-10 px-5 rounded-full bg-[#FFFFFF] border border-[#E5E5E5] text-[#1A1A1A] text-[14px] font-medium hover:bg-[#F4F3EF] active:scale-[0.98] transition-all cursor-pointer"
            >
              Withdraw to Bank
            </button>
          </div>
        </div>

        {/* Subtle Geometric Parcel + Shield Wireframe */}
        <div
          className="hidden md:flex items-center justify-center w-[220px] shrink-0"
          aria-hidden="true"
        >
          <svg
            width="180"
            height="130"
            viewBox="0 0 180 130"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M35 42L80 18L125 42V88L80 112L35 88V42Z"
              stroke="#E5E0D5"
              strokeWidth="1.5"
            />
            <path d="M35 42L80 66L125 42" stroke="#E5E0D5" strokeWidth="1.5" />
            <path d="M80 66V112" stroke="#E5E0D5" strokeWidth="1.5" />
            <path
              d="M57 30L102 54"
              stroke="#FFB800"
              strokeOpacity="0.65"
              strokeWidth="1.5"
            />
            <path
              d="M126 48L148 56V76C148 91 138 103 126 109C114 103 104 91 104 76V56L126 48Z"
              fill="#F8F6F1"
              stroke="#FFB800"
              strokeWidth="1.5"
            />
            <path
              d="M118 77L124 83L135 71"
              stroke="#8A5A00"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </section>

      <WithdrawModal
        open={withdrawOpen}
        availableBalanceNgn={availableBalanceNgn}
        onClose={() => setWithdrawOpen(false)}
      />
    </>
  );
}
