"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { NairaAmount } from "@/components/NairaAmount";
import { ProductImage } from "@/components/ProductImage";
import { ReleaseCodeModal } from "@/components/dashboard/ReleaseCodeModal";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { postJson } from "@/lib/fetch-json";

export interface VendorOrderCard {
  id: string;
  status: string;
  amountNgn: string;
  buyerName: string;
  buyerPhone: string;
  buyerAddress: string;
  releaseAttempts: number;
  deadlineIso: string | null;
  createdAtIso: string;
  productName: string;
  productImageUrl: string | null;
}

const FILTERS = [
  { key: "ALL", label: "All" },
  { key: "SECURED", label: "Ship Now" },
  { key: "SHIPPED", label: "In Transit" },
  { key: "RELEASED", label: "Released" },
  { key: "DISPUTED", label: "Disputed" },
  { key: "REFUNDED", label: "Refunded" },
] as const;

export function VendorOrdersView({ orders }: { orders: VendorOrderCard[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("ALL");
  const [shippingId, setShippingId] = useState<string | null>(null);
  const [releaseOrder, setReleaseOrder] = useState<VendorOrderCard | null>(null);
  const [shipError, setShipError] = useState<string | null>(null);

  const filtered = orders.filter((o) => {
    if (filter !== "ALL" && o.status !== filter) return false;
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      o.buyerName.toLowerCase().includes(q) ||
      o.productName.toLowerCase().includes(q) ||
      o.buyerPhone.toLowerCase().includes(q)
    );
  });

  async function handleMarkShipped(orderId: string) {
    setShipError(null);
    setShippingId(orderId);
    try {
      const { ok, data } = await postJson<{ ok?: boolean }>(
        `/api/vendor/orders/${orderId}/ship`
      );
      if (!ok) {
        setShipError(data.error || "Could not mark order as shipped.");
        setShippingId(null);
        return;
      }
      setShippingId(null);
      router.refresh();
    } catch {
      setShipError("Network error updating order.");
      setShippingId(null);
    }
  }

  return (
    <div className="space-y-5">
      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search buyer or product…"
          className="w-full sm:max-w-[280px] h-10 px-4 rounded-full bg-[#FFFFFF] border border-[#E5E5E5] text-[13px] text-[#1A1A1A] placeholder:text-[#5F6368]/70 focus:outline-none focus:border-[#1A1A1A]"
        />

        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={`h-8 px-3 rounded-lg text-[12px] font-medium transition-colors cursor-pointer ${
                  active
                    ? "bg-[#1A1A1A] text-[#FFFFFF]"
                    : "bg-[#F8F6F1] text-[#5F6368] hover:text-[#1A1A1A]"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {shipError ? (
        <div
          role="alert"
          className="rounded-xl bg-[#FDECEC] border border-[#FECACA] px-3.5 py-2.5 text-[13px] text-[#B42318]"
        >
          {shipError}
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <section className="border border-[#E5E5E5] rounded-2xl p-10 bg-[#FFFFFF] text-center">
          <p className="text-[15px] font-medium text-[#1A1A1A]">
            No matching orders
          </p>
          <p className="mt-1 text-[13px] text-[#5F6368]">
            Orders appear here as soon as buyers check out from your pay links.
          </p>
        </section>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((order) => (
            <article
              key={order.id}
              className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl p-5 flex flex-col justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#E5E5E5] shrink-0 bg-[#FAF9F7]">
                  <ProductImage
                    src={order.productImageUrl}
                    alt={order.productName}
                    className="w-full h-full object-contain p-0.5"
                    placeholderLabel=""
                  />
                </div>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <Link
                    href={`/dashboard/orders/${order.id}`}
                    className="block text-[14px] font-medium text-[#1A1A1A] hover:underline line-clamp-1"
                  >
                    {order.productName}
                  </Link>
                  <OrderStatusBadge status={order.status} variant="seller" />
                </div>
              </div>

              <div className="py-3 border-y border-[#E5E5E5] space-y-2">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[14px] font-medium text-[#1A1A1A] truncate">
                    {order.buyerName}
                  </span>
                  <span className="text-[16px] font-medium text-[#1A1A1A] shrink-0">
                    <NairaAmount value={order.amountNgn} />
                  </span>
                </div>
                <p className="font-mono text-[12px] text-[#5F6368]">
                  {order.buyerPhone}
                </p>
                <p className="text-[12px] text-[#5F6368] line-clamp-2">
                  {order.buyerAddress}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {order.status === "SECURED" ? (
                  <button
                    type="button"
                    disabled={shippingId === order.id}
                    onClick={() => void handleMarkShipped(order.id)}
                    className="flex-1 h-9 px-3 rounded-full border border-[#E5E5E5] bg-[#FFFFFF] text-[12px] font-medium text-[#1A1A1A] hover:bg-[#F4F3EF] disabled:opacity-60 cursor-pointer whitespace-nowrap"
                  >
                    {shippingId === order.id ? "Updating…" : "Mark as shipped"}
                  </button>
                ) : null}

                {order.status === "SECURED" || order.status === "SHIPPED" ? (
                  <button
                    type="button"
                    onClick={() => setReleaseOrder(order)}
                    className="flex-1 h-9 px-3 rounded-full bg-[#1A1A1A] text-[#FFFFFF] text-[12px] font-medium hover:bg-[#1A1A1A]/90 cursor-pointer whitespace-nowrap"
                  >
                    Enter release code
                  </button>
                ) : null}

                <Link
                  href={`/dashboard/orders/${order.id}`}
                  className={`h-9 px-3 rounded-full text-[12px] font-medium inline-flex items-center justify-center ${
                    order.status !== "SECURED" && order.status !== "SHIPPED"
                      ? "w-full border border-[#E5E5E5] text-[#1A1A1A] hover:bg-[#F4F3EF]"
                      : "text-[#5F6368] hover:text-[#1A1A1A]"
                  }`}
                >
                  {order.status === "SECURED" || order.status === "SHIPPED"
                    ? "Details"
                    : "View receipt →"}
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      {releaseOrder ? (
        <ReleaseCodeModal
          open
          orderId={releaseOrder.id}
          productName={releaseOrder.productName}
          amountNgn={releaseOrder.amountNgn}
          initialAttempts={releaseOrder.releaseAttempts}
          onClose={() => setReleaseOrder(null)}
        />
      ) : null}
    </div>
  );
}
