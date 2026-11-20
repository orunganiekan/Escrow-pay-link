"use client";

import { NairaAmount } from "@/components/NairaAmount";

interface WithdrawModalProps {
  open: boolean;
  availableBalanceNgn: string;
  onClose: () => void;
}

export function WithdrawModal({
  open,
  availableBalanceNgn,
  onClose,
}: WithdrawModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A1A]/35 px-4 animate-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="withdraw-modal-title"
    >
      <div className="w-full max-w-[440px] bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl p-6 shadow-[0_8px_24px_rgba(26,26,26,0.06)] animate-modal-pop">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5F6368]">
              BANK PAYOUTS
            </p>
            <h2
              id="withdraw-modal-title"
              className="mt-1 text-[20px] font-semibold tracking-[-0.01em] text-[#1A1A1A]"
            >
              Withdraw to Bank
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#5F6368] hover:bg-[#F4F3EF] cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="mt-5 rounded-xl bg-[#F8F6F1] p-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5F6368]">
            AVAILABLE BALANCE
          </p>
          <p className="mt-1 text-[24px] font-medium text-[#1A1A1A]">
            <NairaAmount value={availableBalanceNgn} />
          </p>
        </div>

        <div className="mt-4 rounded-xl bg-[#FFF4D6] border border-[#FFB800]/40 p-4 text-[13px] text-[#8A5A00] leading-relaxed">
          <strong className="font-medium">Demo Mode</strong> — Payouts launch
          with our banking partner. Real bank transfers are not active in test
          mode.
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-5 rounded-full bg-[#1A1A1A] text-[#FFFFFF] text-[14px] font-medium hover:bg-[#1A1A1A]/90 cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
