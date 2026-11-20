"use client";

import { useState } from "react";

function truncateHash(hash: string): string {
  if (hash.length <= 16) return hash;
  return `${hash.slice(0, 8)}…${hash.slice(-8)}`;
}

interface ChainReceiptDrawerProps {
  status: string;
  txCreate?: string | null;
  txRelease?: string | null;
  txRefund?: string | null;
}

export function ChainReceiptDrawer({
  status,
  txCreate,
  txRelease,
  txRefund,
}: ChainReceiptDrawerProps) {
  const [open, setOpen] = useState(false);

  if (!txCreate) return null;

  const escrowState =
    status === "RELEASED" || status === "REFUNDED" ? "CLAIMED" : "OPEN";

  return (
    <section className="border border-[#E5E5E5] rounded-xl bg-[#FFFFFF] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full px-4 py-3 flex items-center justify-between font-mono text-[12px] text-[#5F6368] hover:bg-[#F4F3EF] transition-colors cursor-pointer"
      >
        <span>Receipt on the chain</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open ? (
        <div className="px-4 pb-4 pt-2 border-t border-[#E5E5E5] space-y-2 font-mono text-[12px] animate-fade-up">
          <div className="flex items-center justify-between">
            <span className="text-[#5F6368]">Escrow Status</span>
            <span className="text-[#1A1A1A]">{escrowState}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[#5F6368]">Escrow Lock Tx</span>
            <a
              href={`https://stellar.expert/explorer/testnet/tx/${txCreate}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1A1A1A] underline underline-offset-2"
            >
              {truncateHash(txCreate)} ↗
            </a>
          </div>
          {txRelease ? (
            <div className="flex items-center justify-between gap-2">
              <span className="text-[#5F6368]">Release Tx</span>
              <a
                href={`https://stellar.expert/explorer/testnet/tx/${txRelease}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1A1A1A] underline underline-offset-2"
              >
                {truncateHash(txRelease)} ↗
              </a>
            </div>
          ) : null}
          {txRefund ? (
            <div className="flex items-center justify-between gap-2">
              <span className="text-[#5F6368]">Refund Tx</span>
              <a
                href={`https://stellar.expert/explorer/testnet/tx/${txRefund}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1A1A1A] underline underline-offset-2"
              >
                {truncateHash(txRefund)} ↗
              </a>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
