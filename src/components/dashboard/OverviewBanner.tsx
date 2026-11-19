"use client";

import { useState } from "react";
import { formatNaira } from "@/lib/format";
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

  const totalResolved = completedCount + disputedCount;
  const completionRate =
    totalResolved > 0 ? Math.round((completedCount / totalResolved) * 100) : 100;

  return (
    <>
      <section className="bg-[#F8F6F1] rounded-2xl p-6 flex items-center justify-between gap-6">
        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-[520px]">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5F6368]">
                AVAILABLE BALANCE
              </p>
              <p className="mt-1.5 font-mono tabular-nums text-[28px] sm:text-[32px] font-medium tracking-[-0.02em] text-[#1A1A1A]">
                {formatNaira(availableBalanceNgn)}
              </p>
            </div>

            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#8A5A00]">
                IN ESCROW
              </p>
              <p className="mt-1.5 font-mono tabular-nums text-[28px] sm:text-[32px] font-medium tracking-[-0.02em] text-[#1A1A1A]">
                {formatNaira(inEscrowNgn)}
              </p>
            </div>
          </div>

          <p className="mt-4 text-[13px] text-[#5F6368]">
            {completedCount} Completed · {disputedCount} Disputed ·{" "}
            <span className="font-mono">{completionRate}%</span> Completion Rate
          </p>

          <div className="mt-5">
            <button
              type="button"
              onClick={() => setWithdrawOpen(true)}
              className="h-10 px-5 rounded-full bg-[#1A1A1A] text-[#FFFFFF] text-[14px] font-medium hover:bg-[#1A1A1A]/90 transition-opacity cursor-pointer"
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
