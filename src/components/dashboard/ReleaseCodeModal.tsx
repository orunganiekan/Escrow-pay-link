"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { NairaAmount } from "@/components/NairaAmount";
import { postJson } from "@/lib/fetch-json";

interface ReleaseCodeModalProps {
  orderId: string;
  productName: string;
  amountNgn: string;
  initialAttempts: number;
  open: boolean;
  onClose: () => void;
  onReleased?: () => void;
}

export function ReleaseCodeModal({
  orderId,
  productName,
  amountNgn,
  initialAttempts,
  open,
  onClose,
  onReleased,
}: ReleaseCodeModalProps) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [attemptsRemaining, setAttemptsRemaining] = useState(
    Math.max(0, 5 - initialAttempts)
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { ok, data } = await postJson<{
        ok?: boolean;
        attemptsRemaining?: number;
      }>(`/api/vendor/orders/${orderId}/release`, {
        code: code.replace(/\s+/g, ""),
      });

      if (!ok) {
        if (typeof data.attemptsRemaining === "number") {
          setAttemptsRemaining(data.attemptsRemaining);
        }
        setError(data.error || "Could not verify release code.");
        setLoading(false);
        return;
      }

      setLoading(false);
      onClose();
      onReleased?.();
      router.refresh();
    } catch {
      setError("Network error verifying code. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A1A]/35 px-4"
      role="dialog"
      aria-modal="true"
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[420px] bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl p-6 shadow-[0_8px_24px_rgba(26,26,26,0.06)] space-y-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5F6368]">
              RELEASE FUNDS
            </p>
            <h2 className="mt-1 text-[18px] font-semibold text-[#1A1A1A]">
              Enter buyer&apos;s 6-digit code
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#5F6368] hover:bg-[#F4F3EF] cursor-pointer"
          >
            ✕
          </button>
        </div>

        <p className="text-[13px] text-[#5F6368]">
          {productName} · <NairaAmount value={amountNgn} />
        </p>

        <div>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            required
            disabled={attemptsRemaining <= 0}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            className="w-full h-14 px-4 rounded-xl bg-[#F8F6F1] border border-[#E5E5E5] text-center font-mono text-[26px] tracking-[0.28em] text-[#1A1A1A] placeholder:text-[#5F6368]/40 focus:outline-none focus:border-[#1A1A1A]"
          />
          <p className="mt-1.5 text-[12px] text-[#5F6368] text-center">
            {attemptsRemaining} of 5 attempts remaining
          </p>
        </div>

        {error ? (
          <div
            role="alert"
            className="rounded-xl bg-[#FDECEC] border border-[#FECACA] px-3.5 py-2.5 text-[13px] text-[#B42318]"
          >
            {error}
          </div>
        ) : null}

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-4 rounded-full border border-[#E5E5E5] text-[13px] font-medium text-[#1A1A1A] hover:bg-[#F4F3EF] cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || code.length !== 6 || attemptsRemaining <= 0}
            className="h-10 px-5 rounded-full bg-[#1A1A1A] text-[#FFFFFF] text-[13px] font-medium hover:bg-[#1A1A1A]/90 disabled:opacity-60 cursor-pointer"
          >
            {loading ? "Releasing…" : "Confirm & Release"}
          </button>
        </div>
      </form>
    </div>
  );
}
