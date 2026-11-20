"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { NairaAmount } from "@/components/NairaAmount";
import { ProductImage } from "@/components/ProductImage";
import { formatDeliveryWindow, formatNaira } from "@/lib/format";

export interface BuyerOrderData {
  id: string;
  token: string;
  status: string;
  amountNgn: string;
  buyerName: string;
  buyerAddress: string;
  paystackAuthorizationUrl: string | null;
  deadlineIso: string | null;
  shippedAtIso: string | null;
  disputeReason: string | null;
  resolvedAtIso: string | null;
  releaseCode: string | null;
  claimableBalanceId: string | null;
  txCreate: string | null;
  txRelease: string | null;
  txRefund: string | null;
  productName: string;
  productImageUrl: string | null;
  windowMinutes: number;
  vendorName: string;
}

function formatRemainingCountdown(msRemaining: number): string {
  if (msRemaining <= 0) return "Delivery window expired";
  const totalSeconds = Math.floor(msRemaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) return `${days}d ${hours}h left for delivery`;
  if (hours > 0) return `${hours}h ${minutes}m left for delivery`;
  if (minutes > 0) return `${minutes}m ${seconds}s left for delivery`;
  return `${seconds}s left for delivery`;
}

function formatSpacedCode(code: string): string {
  if (code.length !== 6) return code;
  return `${code.slice(0, 3)} ${code.slice(3)}`;
}

function truncateHash(hash: string): string {
  if (hash.length <= 16) return hash;
  return `${hash.slice(0, 8)}…${hash.slice(-8)}`;
}

export function BuyerOrderView({
  order,
  shouldVerifyOnMount,
}: {
  order: BuyerOrderData;
  shouldVerifyOnMount: boolean;
}) {
  const router = useRouter();
  const [nowMs, setNowMs] = useState<number | null>(null);
  const [verifying, setVerifying] = useState(
    shouldVerifyOnMount && order.status === "PENDING_PAYMENT"
  );
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [chainOpen, setChainOpen] = useState(false);
  const [phase5Notice, setPhase5Notice] = useState<string | null>(null);

  const shortOrderCode = `ORDER #EPL-${order.id.slice(-4).toUpperCase()}`;

  const runVerify = useCallback(async () => {
    setVerifying(true);
    setVerifyMessage(null);
    try {
      const res = await fetch(`/api/orders/${order.token}/verify-paystack`, {
        method: "POST",
      });
      const data = (await res.json()) as {
        verified?: boolean;
        status?: string;
        paystackStatus?: string;
        error?: string;
      };

      if (!res.ok) {
        setVerifyMessage(data.error || "Could not verify payment yet.");
        setVerifying(false);
        return;
      }

      if (data.verified || (data.status && data.status !== "PENDING_PAYMENT")) {
        router.replace(`/o/${order.token}`);
        router.refresh();
        return;
      }

      setVerifyMessage(
        "Payment not confirmed yet. Complete checkout via Paystack and refresh."
      );
      setVerifying(false);
    } catch {
      setVerifyMessage("Network error checking payment status.");
      setVerifying(false);
    }
  }, [order.token, router]);

  useEffect(() => {
    if (shouldVerifyOnMount && order.status === "PENDING_PAYMENT") {
      const id = setTimeout(() => {
        void runVerify();
      }, 0);
      return () => clearTimeout(id);
    }
  }, [shouldVerifyOnMount, order.status, runVerify]);

  // Poll cleanly while PROCESSING_PAYMENT
  useEffect(() => {
    if (order.status !== "PROCESSING_PAYMENT") return;
    const interval = setInterval(() => {
      router.refresh();
    }, 2500);
    return () => clearInterval(interval);
  }, [order.status, router]);

  // Live countdown tick for SECURED / SHIPPED / DISPUTED
  useEffect(() => {
    if (
      !order.deadlineIso ||
      (order.status !== "SECURED" &&
        order.status !== "SHIPPED" &&
        order.status !== "DISPUTED")
    ) {
      return;
    }
    const initId = setTimeout(() => setNowMs(Date.now()), 0);
    const interval = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => {
      clearTimeout(initId);
      clearInterval(interval);
    };
  }, [order.deadlineIso, order.status]);

  async function handleCopyOrderLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }

  async function handleCopyCode() {
    if (!order.releaseCode) return;
    await navigator.clipboard.writeText(order.releaseCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  }

  const deadlineMs = order.deadlineIso ? Date.parse(order.deadlineIso) : null;
  const totalWindowMs = order.windowMinutes * 60_000;
  const msRemaining =
    deadlineMs !== null && nowMs !== null ? deadlineMs - nowMs : totalWindowMs;
  const isExpired = deadlineMs !== null && nowMs !== null && msRemaining <= 0;
  const progressPct =
    deadlineMs !== null && totalWindowMs > 0
      ? Math.max(0, Math.min(100, (msRemaining / totalWindowMs) * 100))
      : 0;

  const isProcessing =
    order.status === "PROCESSING_PAYMENT" ||
    (verifying && order.status === "PENDING_PAYMENT");

  const showPostPayment =
    order.status !== "PENDING_PAYMENT" && !isProcessing;

  return (
    <div className="min-h-screen bg-[#FFFFFF] flex flex-col">
      {/* Minimal Header */}
      <header className="w-full border-b border-[#E5E5E5] bg-[#FFFFFF] sticky top-0 z-20">
        <div className="max-w-[460px] mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <Link
            href="/"
            className="text-[15px] font-semibold tracking-tight text-[#1A1A1A]"
          >
            EscrowPay
          </Link>
          <button
            type="button"
            onClick={handleCopyOrderLink}
            className="h-8 px-3.5 rounded-full border border-[#E5E5E5] bg-[#FFFFFF] text-[12px] font-medium text-[#1A1A1A] hover:bg-[#F4F3EF] cursor-pointer"
          >
            {copiedLink ? "Copied ✓" : "Copy order link"}
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[460px] mx-auto px-4 py-6 space-y-4">
        {/* ── State 2B: PROCESSING_PAYMENT ── */}
        {isProcessing ? (
          <section className="bg-[#F8F6F1] border border-[#ECE8DF] rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5F6368]">
                {shortOrderCode}
              </span>
              <span className="inline-flex items-center gap-1.5 font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-[#FFF4D6] text-[#8A5A00] border border-[#FFB800]/50">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFB800] animate-pulse" />
                Confirming Payment…
              </span>
            </div>
            <h1 className="text-[22px] font-medium text-[#1A1A1A] leading-snug">
              Locking <NairaAmount value={order.amountNgn} /> in escrow…
            </h1>
            <p className="text-[14px] text-[#5F6368] leading-relaxed">
              Confirming your transfer and locking funds in escrow. This usually
              takes about 5 seconds.
            </p>
            <div className="h-1 w-full rounded-full bg-[#E5E5E5] overflow-hidden">
              <div className="h-full w-2/3 rounded-full bg-[#FFB800] animate-pulse" />
            </div>
          </section>
        ) : null}

        {/* ── State 2A: PENDING_PAYMENT ── */}
        {order.status === "PENDING_PAYMENT" && !isProcessing ? (
          <>
            <section className="bg-[#F8F6F1] border border-[#ECE8DF] rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5F6368]">
                  {shortOrderCode}
                </span>
                <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-[#F2F0EB] text-[#5F6368] border border-[#E5E5E5]">
                  Awaiting Payment
                </span>
              </div>

              <span className="inline-block font-mono text-[11px] uppercase tracking-[0.06em] px-2.5 py-1 rounded-full bg-[#FFF4D6] text-[#8A5A00] border border-[#FFB800]/50">
                TEST MODE · Paystack Sandbox
              </span>

              <h1 className="text-[22px] font-medium text-[#1A1A1A] leading-snug">
                Complete payment to lock{" "}
                <NairaAmount value={order.amountNgn} /> in escrow.
              </h1>
              <p className="text-[14px] text-[#5F6368] leading-relaxed">
                Use Paystack Bank Transfer (or Simulate Success in Test Mode) to
                secure your order.
              </p>
            </section>

            {order.paystackAuthorizationUrl ? (
              <div className="space-y-2.5">
                <a
                  href={order.paystackAuthorizationUrl}
                  className="w-full h-12 rounded-full bg-[#1A1A1A] text-[#FFFFFF] text-[14px] font-medium flex items-center justify-center hover:bg-[#1A1A1A]/90"
                >
                  Pay {formatNaira(order.amountNgn)} via Paystack →
                </a>
                <button
                  type="button"
                  onClick={() => void runVerify()}
                  className="w-full py-2 text-[13px] font-medium text-[#5F6368] hover:text-[#1A1A1A] cursor-pointer"
                >
                  Already paid? Refresh status
                </button>
              </div>
            ) : null}

            {verifyMessage ? (
              <div className="rounded-xl bg-[#FFF4D6] border border-[#FFB800]/50 px-3.5 py-2.5 text-[13px] text-[#8A5A00]">
                {verifyMessage}
              </div>
            ) : null}
          </>
        ) : null}

        {/* ── State 2C / 2D / 2E / 2F: Active, Disputed, or Terminal Status Banner ── */}
        {showPostPayment ? (
          <section className="bg-[#F8F6F1] border border-[#ECE8DF] rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5F6368]">
                {shortOrderCode}
              </span>

              {order.status === "SECURED" ? (
                <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-[#FFF4D6] text-[#8A5A00] border border-[#FFB800]">
                  Funds Locked in Escrow
                </span>
              ) : null}

              {order.status === "SHIPPED" ? (
                <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-[#EEF4FF] text-[#1E40AF] border border-[#BFDBFE]">
                  Shipped — In Transit
                </span>
              ) : null}

              {order.status === "DISPUTED" ? (
                <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-[#FDECEC] text-[#B42318] border border-[#FECACA]">
                  Disputed — Frozen
                </span>
              ) : null}

              {order.status === "RELEASED" ? (
                <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-[#EBF7EE] text-[#1E6B3A] border border-[#BBF7D0]">
                  Delivered &amp; Released
                </span>
              ) : null}

              {order.status === "REFUNDED" ? (
                <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-[#F2F0EB] text-[#5F6368] border border-[#E5E5E5]">
                  Refunded
                </span>
              ) : null}
            </div>

            {/* Headlines */}
            {(order.status === "SECURED" || order.status === "SHIPPED") &&
            !isExpired ? (
              <h1 className="text-[22px] font-medium text-[#1A1A1A] leading-snug">
                Your <NairaAmount value={order.amountNgn} /> is safe.
              </h1>
            ) : null}

            {(order.status === "SECURED" ||
              order.status === "SHIPPED" ||
              order.status === "DISPUTED") &&
            isExpired ? (
              <h1 className="text-[22px] font-medium text-[#1A1A1A] leading-snug">
                Delivery deadline passed — refund available.
              </h1>
            ) : null}

            {order.status === "DISPUTED" && !isExpired ? (
              <>
                <h1 className="text-[22px] font-medium text-[#1A1A1A] leading-snug">
                  Payout frozen for review.
                </h1>
                {order.disputeReason ? (
                  <p className="text-[13px] text-[#1A1A1A] bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl p-3">
                    {order.disputeReason}
                  </p>
                ) : null}
                <p className="text-[13px] text-[#5F6368]">
                  An administrator is reviewing this order. Funds cannot be
                  released to the seller while disputed.
                </p>
              </>
            ) : null}

            {order.status === "RELEASED" ? (
              <h1 className="text-[22px] font-medium text-[#1A1A1A] leading-snug">
                Delivery confirmed —{" "}
                <NairaAmount value={order.amountNgn} /> released.
              </h1>
            ) : null}

            {order.status === "REFUNDED" ? (
              <h1 className="text-[22px] font-medium text-[#1A1A1A] leading-snug">
                <NairaAmount value={order.amountNgn} /> refunded to buyer.
              </h1>
            ) : null}

            {/* Countdown Bar */}
            {deadlineMs !== null &&
            (order.status === "SECURED" ||
              order.status === "SHIPPED" ||
              order.status === "DISPUTED") ? (
              <div className="pt-1 space-y-1.5">
                <div className="h-1 w-full rounded-full bg-[#E5E5E5] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#FFB800] transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <p className="font-mono text-[12px] text-[#5F6368]">
                  {formatRemainingCountdown(msRemaining)}
                </p>
              </div>
            ) : null}
          </section>
        ) : null}

        {/* ── 6-Digit Release Code Card (SECURED / SHIPPED) ── */}
        {(order.status === "SECURED" || order.status === "SHIPPED") &&
        order.releaseCode ? (
          <section className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl p-6 shadow-[0_8px_24px_rgba(26,26,26,0.06)] text-center space-y-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5F6368]">
              YOUR RELEASE CODE
            </p>
            <div className="flex items-center justify-center gap-3">
              <p className="font-mono text-[28px] sm:text-[32px] font-medium tracking-[0.16em] text-[#1A1A1A] whitespace-nowrap select-all">
                {formatSpacedCode(order.releaseCode)}
              </p>
              <button
                type="button"
                onClick={handleCopyCode}
                className="h-8 px-3 rounded-full border border-[#E5E5E5] text-[12px] font-medium text-[#5F6368] hover:text-[#1A1A1A] hover:bg-[#F4F3EF] cursor-pointer"
              >
                {copiedCode ? "Copied" : "Copy"}
              </button>
            </div>
            <p className="text-[13px] text-[#5F6368] leading-relaxed max-w-[340px] mx-auto">
              Share this code with the seller{" "}
              <strong className="font-medium text-[#1A1A1A]">only</strong> when
              your item is in your hands. Giving this code releases your money.
            </p>
          </section>
        ) : null}

        {/* ── Order Summary Card ── */}
        <section className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-xl overflow-hidden border border-[#E5E5E5] shrink-0 bg-[#FAF9F7]">
              <ProductImage
                src={order.productImageUrl}
                alt={order.productName}
                className="w-full h-full object-contain p-1"
                placeholderLabel=""
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-medium text-[#1A1A1A] truncate">
                {order.productName}
              </p>
              <p className="text-[13px] text-[#5F6368]">
                Sold by {order.vendorName} ·{" "}
                {formatDeliveryWindow(order.windowMinutes)} window
              </p>
            </div>
            <span className="text-[16px] font-medium text-[#1A1A1A] shrink-0">
              <NairaAmount value={order.amountNgn} />
            </span>
          </div>

          <div className="pt-3 border-t border-[#E5E5E5] text-[13px] text-[#5F6368] space-y-1">
            <p className="font-mono text-[11px] uppercase tracking-[0.08em]">
              DELIVERING TO
            </p>
            <p className="text-[#1A1A1A] font-medium">{order.buyerName}</p>
            <p>{order.buyerAddress}</p>
          </div>
        </section>

        {/* ── Resolution Actions (SECURED / SHIPPED / EXPIRED DISPUTED) ── */}
        {(order.status === "SECURED" ||
          order.status === "SHIPPED" ||
          (order.status === "DISPUTED" && isExpired)) ? (
          <section className="pt-1 space-y-2.5">
            {isExpired ? (
              <button
                type="button"
                onClick={() =>
                  setPhase5Notice(
                    "Buyer refund & dispute actions are wired in Phase 5."
                  )
                }
                className="w-full h-12 rounded-full bg-[#1A1A1A] text-[#FFFFFF] text-[14px] font-medium hover:bg-[#1A1A1A]/90 cursor-pointer"
              >
                Claim full refund
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setPhase5Notice(
                      "Dispute filing is wired in Phase 5."
                    )
                  }
                  className="h-11 rounded-full border border-[#E5E5E5] bg-[#FFFFFF] text-[13px] font-medium text-[#1A1A1A] hover:bg-[#F4F3EF] cursor-pointer"
                >
                  Report a problem
                </button>
                <button
                  type="button"
                  disabled
                  title="Available after delivery window expires"
                  className="h-11 rounded-full border border-[#E5E5E5] bg-[#FFFFFF] text-[13px] font-medium text-[#5F6368] opacity-50 cursor-not-allowed"
                >
                  Claim full refund
                </button>
              </div>
            )}

            {!isExpired ? (
              <p className="text-center text-[12px] text-[#5F6368]">
                Full refund unlocks automatically after the delivery window
                expires.
              </p>
            ) : null}

            {phase5Notice ? (
              <div className="rounded-xl bg-[#FFF4D6] border border-[#FFB800]/50 px-3.5 py-2.5 text-[13px] text-[#8A5A00]">
                {phase5Notice}
              </div>
            ) : null}
          </section>
        ) : null}

        {/* ── Collapsed Chain Receipt Drawer ── */}
        {showPostPayment && order.txCreate ? (
          <section className="border border-[#E5E5E5] rounded-xl bg-[#FFFFFF] overflow-hidden">
            <button
              type="button"
              onClick={() => setChainOpen((prev) => !prev)}
              className="w-full px-4 py-3 flex items-center justify-between font-mono text-[12px] text-[#5F6368] hover:bg-[#F4F3EF] cursor-pointer"
            >
              <span>Receipt on the chain</span>
              <span>{chainOpen ? "⌃" : "⌄"}</span>
            </button>

            {chainOpen ? (
              <div className="px-4 pb-4 pt-2 border-t border-[#E5E5E5] space-y-2 font-mono text-[12px]">
                <div className="flex items-center justify-between">
                  <span className="text-[#5F6368]">Escrow Status</span>
                  <span className="text-[#1A1A1A]">
                    {order.status === "RELEASED" || order.status === "REFUNDED"
                      ? "CLAIMED"
                      : "OPEN"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[#5F6368]">Escrow Lock Tx</span>
                  <a
                    href={`https://stellar.expert/explorer/testnet/tx/${order.txCreate}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#1A1A1A] underline underline-offset-2"
                  >
                    {truncateHash(order.txCreate)} ↗
                  </a>
                </div>
                {order.txRelease ? (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[#5F6368]">Release Tx</span>
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${order.txRelease}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#1A1A1A] underline underline-offset-2"
                    >
                      {truncateHash(order.txRelease)} ↗
                    </a>
                  </div>
                ) : null}
                {order.txRefund ? (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[#5F6368]">Refund Tx</span>
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${order.txRefund}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#1A1A1A] underline underline-offset-2"
                    >
                      {truncateHash(order.txRefund)} ↗
                    </a>
                  </div>
                ) : null}
              </div>
            ) : null}
          </section>
        ) : null}
      </main>
    </div>
  );
}
