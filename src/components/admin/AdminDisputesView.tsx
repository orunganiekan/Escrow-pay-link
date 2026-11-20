"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { NairaAmount } from "@/components/NairaAmount";
import { ChainReceiptDrawer } from "@/components/order/ChainReceiptDrawer";
import { postJson } from "@/lib/fetch-json";

export interface AdminDisputeItem {
  id: string;
  status: string;
  amountNgn: string;
  productName: string;
  vendorName: string;
  buyerName: string;
  buyerPhone: string;
  disputeReason: string | null;
  deadlineIso: string | null;
  txCreate: string | null;
  txRelease: string | null;
  txRefund: string | null;
}

export function AdminDisputesView({
  disputes,
}: {
  disputes: AdminDisputeItem[];
}) {
  const router = useRouter();
  const [nowMs, setNowMs] = useState<number | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initId = setTimeout(() => setNowMs(Date.now()), 0);
    const interval = setInterval(() => setNowMs(Date.now()), 5000);
    return () => {
      clearTimeout(initId);
      clearInterval(interval);
    };
  }, []);

  async function handleResolve(orderId: string, action: "release" | "refund") {
    setError(null);
    setBusyKey(`${orderId}:${action}`);
    try {
      const { ok, data } = await postJson<{ ok?: boolean }>(
        `/api/admin/orders/${orderId}/resolve`,
        { action }
      );
      if (!ok) {
        setError(data.error || "Could not resolve dispute.");
        setBusyKey(null);
        return;
      }
      setBusyKey(null);
      router.refresh();
    } catch {
      setError("Network error resolving dispute.");
      setBusyKey(null);
    }
  }

  return (
    <div className="space-y-5">
      {error ? (
        <div
          role="alert"
          className="rounded-xl bg-[#FDECEC] border border-[#FECACA] px-4 py-3 text-[13px] text-[#B42318]"
        >
          {error}
        </div>
      ) : null}

      {disputes.length === 0 ? (
        <section className="border border-[#E5E5E5] rounded-2xl p-10 bg-[#FFFFFF] text-center">
          <p className="text-[15px] font-medium text-[#1A1A1A]">
            No open disputes
          </p>
          <p className="mt-1 text-[13px] text-[#5F6368]">
            Disputed orders submitted by buyers appear here for arbitration.
          </p>
        </section>
      ) : (
        <div className="space-y-4">
          {disputes.map((item) => {
            const isExpired = Boolean(
              item.deadlineIso &&
                nowMs !== null &&
                Date.parse(item.deadlineIso) <= nowMs
            );
            return (
            <article
              key={item.id}
              className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl p-6 space-y-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5F6368]">
                    ORDER #EPL-{item.id.slice(-4).toUpperCase()} ·{" "}
                    {item.vendorName}
                  </p>
                  <h2 className="mt-1 text-[17px] font-medium text-[#1A1A1A]">
                    {item.productName}
                  </h2>
                  <p className="mt-0.5 text-[13px] text-[#5F6368]">
                    Buyer: {item.buyerName} ({item.buyerPhone})
                  </p>
                </div>
                <span className="text-[20px] font-medium text-[#1A1A1A]">
                  <NairaAmount value={item.amountNgn} />
                </span>
              </div>

              {item.disputeReason ? (
                <div className="rounded-xl bg-[#FDECEC] border border-[#FECACA] p-3.5 text-[13px] text-[#B42318]">
                  <strong className="font-medium">Dispute reason:</strong>{" "}
                  {item.disputeReason}
                </div>
              ) : null}

              {isExpired ? (
                <p className="text-[13px] text-[#5F6368] bg-[#F8F6F1] rounded-xl p-3">
                  Escrow window expired on-chain; buyer can claim refund
                  directly.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:inline-flex items-center gap-3">
                  <button
                    type="button"
                    disabled={busyKey !== null}
                    onClick={() => void handleResolve(item.id, "refund")}
                    className="h-10 px-5 rounded-full border border-[#E5E5E5] bg-[#FFFFFF] text-[13px] font-medium text-[#1A1A1A] hover:bg-[#FDECEC] hover:border-[#FECACA] hover:text-[#B42318] transition-colors disabled:opacity-60 cursor-pointer"
                  >
                    {busyKey === `${item.id}:refund`
                      ? "Refunding…"
                      : "Refund Buyer"}
                  </button>
                  <button
                    type="button"
                    disabled={busyKey !== null}
                    onClick={() => void handleResolve(item.id, "release")}
                    className="h-10 px-5 rounded-full border border-[#E5E5E5] bg-[#FFFFFF] text-[13px] font-medium text-[#1A1A1A] hover:bg-[#EBF7EE] hover:border-[#BBF7D0] hover:text-[#1E6B3A] transition-colors disabled:opacity-60 cursor-pointer"
                  >
                    {busyKey === `${item.id}:release`
                      ? "Releasing…"
                      : "Release to Seller"}
                  </button>
                </div>
              )}

              <ChainReceiptDrawer
                status={item.status}
                txCreate={item.txCreate}
                txRelease={item.txRelease}
                txRefund={item.txRefund}
              />
            </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
