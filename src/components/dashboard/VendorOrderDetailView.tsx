"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { NairaAmount } from "@/components/NairaAmount";
import { ProductImage } from "@/components/ProductImage";
import { ChainReceiptDrawer } from "@/components/order/ChainReceiptDrawer";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { postJson } from "@/lib/fetch-json";

export interface VendorOrderDetail {
  id: string;
  status: string;
  amountNgn: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string | null;
  buyerAddress: string;
  releaseAttempts: number;
  deadlineIso: string | null;
  disputeReason: string | null;
  txCreate: string | null;
  txRelease: string | null;
  txRefund: string | null;
  productName: string;
  productImageUrl: string | null;
}

export function VendorOrderDetailView({
  order,
}: {
  order: VendorOrderDetail;
}) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [attemptsRemaining, setAttemptsRemaining] = useState(
    Math.max(0, 5 - order.releaseAttempts)
  );
  const [shipping, setShipping] = useState(false);
  const [releasing, setReleasing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleShip() {
    setError(null);
    setShipping(true);
    try {
      const { ok, data } = await postJson<{ ok?: boolean }>(
        `/api/vendor/orders/${order.id}/ship`
      );
      if (!ok) {
        setError(data.error || "Could not mark order as shipped.");
        setShipping(false);
        return;
      }
      setShipping(false);
      router.refresh();
    } catch {
      setError("Network error updating order.");
      setShipping(false);
    }
  }

  async function handleRelease(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setReleasing(true);
    try {
      const { ok, data } = await postJson<{
        ok?: boolean;
        attemptsRemaining?: number;
      }>(`/api/vendor/orders/${order.id}/release`, {
        code: code.replace(/\s+/g, ""),
      });

      if (!ok) {
        if (typeof data.attemptsRemaining === "number") {
          setAttemptsRemaining(data.attemptsRemaining);
        }
        setError(data.error || "Could not release funds.");
        setReleasing(false);
        return;
      }

      setReleasing(false);
      router.refresh();
    } catch {
      setError("Network error releasing funds.");
      setReleasing(false);
    }
  }

  return (
    <div className="max-w-[680px] space-y-5">
      <Link
        href="/dashboard/orders"
        className="text-[13px] font-medium text-[#5F6368] hover:text-[#1A1A1A] inline-block"
      >
        ← Back to Orders
      </Link>

      <section className="bg-[#F8F6F1] border border-[#ECE8DF] rounded-2xl p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5F6368]">
            ORDER #EPL-{order.id.slice(-4).toUpperCase()}
          </span>
          <OrderStatusBadge status={order.status} variant="seller" />
        </div>

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl overflow-hidden border border-[#E5E5E5] bg-[#FFFFFF] shrink-0">
            <ProductImage
              src={order.productImageUrl}
              alt={order.productName}
              className="w-full h-full object-contain p-1"
              placeholderLabel=""
            />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-[18px] font-semibold text-[#1A1A1A] truncate">
              {order.productName}
            </h1>
            <p className="mt-0.5 text-[22px] font-medium text-[#1A1A1A]">
              <NairaAmount value={order.amountNgn} />
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl p-6 space-y-2">
        <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5F6368]">
          DELIVERY DETAILS
        </p>
        <p className="text-[15px] font-medium text-[#1A1A1A]">
          {order.buyerName}
        </p>
        <p className="font-mono text-[13px] text-[#5F6368]">
          {order.buyerPhone}
          {order.buyerEmail ? ` · ${order.buyerEmail}` : ""}
        </p>
        <p className="text-[14px] text-[#1A1A1A] pt-1">{order.buyerAddress}</p>
      </section>

      {order.status === "DISPUTED" && order.disputeReason ? (
        <section className="bg-[#FDECEC] border border-[#FECACA] rounded-2xl p-5 space-y-1.5">
          <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#B42318]">
            DISPUTE REASON
          </p>
          <p className="text-[14px] text-[#1A1A1A]">{order.disputeReason}</p>
        </section>
      ) : null}

      {order.status === "SECURED" || order.status === "SHIPPED" ? (
        <section className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl p-6 space-y-5">
          {order.status === "SECURED" ? (
            <div className="pb-5 border-b border-[#E5E5E5] flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[14px] font-medium text-[#1A1A1A]">
                  Ready to dispatch?
                </p>
                <p className="text-[13px] text-[#5F6368]">
                  Let the buyer know their order is on the way.
                </p>
              </div>
              <button
                type="button"
                disabled={shipping}
                onClick={() => void handleShip()}
                className="h-10 px-5 rounded-full border border-[#E5E5E5] bg-[#FFFFFF] text-[13px] font-medium text-[#1A1A1A] hover:bg-[#F4F3EF] disabled:opacity-60 cursor-pointer"
              >
                {shipping ? "Updating…" : "Mark as shipped"}
              </button>
            </div>
          ) : null}

          <form onSubmit={handleRelease} className="space-y-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5F6368]">
                CONFIRM DELIVERY
              </p>
              <h2 className="mt-1 text-[16px] font-medium text-[#1A1A1A]">
                Enter buyer&apos;s 6-digit release code
              </h2>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                required
                disabled={attemptsRemaining <= 0}
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="000000"
                className="flex-1 h-12 px-4 rounded-xl bg-[#F8F6F1] border border-[#E5E5E5] text-center font-mono text-[22px] tracking-[0.26em] text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
              />
              <button
                type="submit"
                disabled={
                  releasing || code.length !== 6 || attemptsRemaining <= 0
                }
                className="h-12 px-6 rounded-full bg-[#1A1A1A] text-[#FFFFFF] text-[14px] font-medium hover:bg-[#1A1A1A]/90 disabled:opacity-60 cursor-pointer shrink-0"
              >
                {releasing ? "Releasing…" : "Confirm & Release"}
              </button>
            </div>

            <p className="text-[12px] text-[#5F6368]">
              {attemptsRemaining} of 5 attempts remaining
            </p>

            {error ? (
              <div
                role="alert"
                className="rounded-xl bg-[#FDECEC] border border-[#FECACA] px-3.5 py-2.5 text-[13px] text-[#B42318]"
              >
                {error}
              </div>
            ) : null}
          </form>
        </section>
      ) : null}

      <ChainReceiptDrawer
        status={order.status}
        txCreate={order.txCreate}
        txRelease={order.txRelease}
        txRefund={order.txRefund}
      />
    </div>
  );
}
