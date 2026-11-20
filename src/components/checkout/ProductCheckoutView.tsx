"use client";

import Link from "next/link";
import { useState } from "react";
import { NairaAmount } from "@/components/NairaAmount";
import { ProductImage } from "@/components/ProductImage";
import { formatDeliveryWindow, formatNaira } from "@/lib/format";

export interface PublicProductData {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  priceNgn: string;
  windowMinutes: number;
  vendorName: string;
  completedOrders: number;
  disputedOrders: number;
}

export function ProductCheckoutView({
  product,
}: {
  product: PublicProductData;
}) {
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerAddress, setBuyerAddress] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const windowLabel = formatDeliveryWindow(product.windowMinutes);
  const windowEyebrow =
    product.windowMinutes === 2
      ? "2M TEST WINDOW"
      : `${windowLabel.toUpperCase()} DELIVERY WINDOW`;

  const totalResolved = product.completedOrders + product.disputedOrders;
  const completionRate =
    totalResolved > 0
      ? Math.round((product.completedOrders / totalResolved) * 100)
      : 100;

  const initials = product.vendorName
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setNotice(
      "Paystack test checkout & escrow order creation are wired in Phase 4."
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] flex flex-col">
      {/* Minimal 56px Mobile-First Top Bar */}
      <header className="w-full border-b border-[#E5E5E5] bg-[#FFFFFF] sticky top-0 z-20">
        <div className="max-w-[460px] mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="text-[15px] font-semibold tracking-tight text-[#1A1A1A]"
          >
            EscrowPay
          </Link>
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.06em] text-[#5F6368] bg-[#F8F6F1] border border-[#E5E5E5] rounded-full px-3 py-1">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            Escrow Protected
          </span>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[460px] mx-auto px-4 pt-5 pb-32 space-y-4">
        {/* Product Hero Card */}
        <section className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl overflow-hidden">
          <div className="aspect-[4/3] w-full overflow-hidden border-b border-[#E5E5E5] bg-[#FAF9F7]">
            <ProductImage
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-contain p-3"
              placeholderLabel="Product photo"
            />
          </div>

          <div className="p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5F6368]">
              {windowEyebrow}
            </p>
            <h1 className="mt-1.5 text-[20px] font-medium text-[#1A1A1A] leading-snug">
              {product.name}
            </h1>
            {product.description ? (
              <p className="mt-1.5 text-[14px] text-[#5F6368] leading-relaxed line-clamp-3">
                {product.description}
              </p>
            ) : null}
            <p className="mt-3 text-[28px] font-medium tracking-[-0.02em] text-[#1A1A1A]">
              <NairaAmount value={product.priceNgn} />
            </p>
          </div>
        </section>

        {/* Earned Seller Trust Strip */}
        <section className="bg-[#F8F6F1] border border-[#ECE8DF] rounded-xl p-3.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-8 h-8 rounded-full bg-[#FFFFFF] border border-[#E5E5E5] flex items-center justify-center text-[12px] font-medium text-[#1A1A1A] shrink-0">
                {initials || "S"}
              </span>
              <span className="text-[14px] font-medium text-[#1A1A1A] truncate">
                {product.vendorName}
              </span>
            </div>
            <span className="font-mono text-[11px] text-[#1A1A1A] shrink-0">
              {totalResolved > 0
                ? `${completionRate}% completed · ${product.completedOrders} ${
                    product.completedOrders === 1 ? "order" : "orders"
                  }`
                : "New seller · Protected"}
            </span>
          </div>
          {totalResolved > 0 ? (
            <div className="mt-3 h-1 w-full rounded-full bg-[#E5E5E5] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#FFB800]"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          ) : null}
        </section>

        {/* Zero-Signup Delivery Form */}
        <form
          id="checkout-form"
          onSubmit={handleSubmit}
          className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl p-5 space-y-3"
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5F6368]">
            DELIVERY DETAILS
          </p>

          <div>
            <label
              htmlFor="buyerName"
              className="block text-[13px] font-medium text-[#1A1A1A] mb-1"
            >
              Full Name <span className="text-[#B42318]">*</span>
            </label>
            <input
              id="buyerName"
              type="text"
              required
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              placeholder="Amaka Okafor"
              className="w-full h-11 px-3.5 rounded-xl bg-[#FFFFFF] border border-[#E5E5E5] text-[14px] text-[#1A1A1A] placeholder:text-[#5F6368]/60 focus:outline-none focus:border-[#1A1A1A]"
            />
          </div>

          <div>
            <label
              htmlFor="buyerPhone"
              className="block text-[13px] font-medium text-[#1A1A1A] mb-1"
            >
              Phone / WhatsApp Number <span className="text-[#B42318]">*</span>
            </label>
            <input
              id="buyerPhone"
              type="tel"
              required
              value={buyerPhone}
              onChange={(e) => setBuyerPhone(e.target.value)}
              placeholder="0803 123 4567"
              className="w-full h-11 px-3.5 rounded-xl bg-[#FFFFFF] border border-[#E5E5E5] text-[14px] text-[#1A1A1A] placeholder:text-[#5F6368]/60 focus:outline-none focus:border-[#1A1A1A]"
            />
          </div>

          <div>
            <label
              htmlFor="buyerAddress"
              className="block text-[13px] font-medium text-[#1A1A1A] mb-1"
            >
              Delivery Address <span className="text-[#B42318]">*</span>
            </label>
            <textarea
              id="buyerAddress"
              rows={2}
              required
              value={buyerAddress}
              onChange={(e) => setBuyerAddress(e.target.value)}
              placeholder="14 Admiralty Way, Lekki Phase 1, Lagos"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#E5E5E5] text-[14px] text-[#1A1A1A] placeholder:text-[#5F6368]/60 focus:outline-none focus:border-[#1A1A1A] resize-none"
            />
          </div>

          <div>
            <label
              htmlFor="buyerEmail"
              className="block text-[13px] font-medium text-[#1A1A1A] mb-1"
            >
              Email{" "}
              <span className="text-[#5F6368] font-normal">
                (Optional — for payment receipt)
              </span>
            </label>
            <input
              id="buyerEmail"
              type="email"
              value={buyerEmail}
              onChange={(e) => setBuyerEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full h-11 px-3.5 rounded-xl bg-[#FFFFFF] border border-[#E5E5E5] text-[14px] text-[#1A1A1A] placeholder:text-[#5F6368]/60 focus:outline-none focus:border-[#1A1A1A]"
            />
          </div>

          <p className="pt-1 text-[12px] text-[#5F6368] leading-relaxed">
            No account or password needed. After paying, keep your order link
            to view your release code.
          </p>

          {notice ? (
            <div className="rounded-xl bg-[#FFF4D6] border border-[#FFB800]/50 px-3.5 py-2.5 text-[13px] text-[#8A5A00]">
              {notice}
            </div>
          ) : null}
        </form>
      </main>

      {/* Sticky Bottom CTA Bar */}
      <footer className="fixed bottom-0 inset-x-0 z-20 bg-[#FFFFFF] border-t border-[#E5E5E5] shadow-[0_-6px_20px_rgba(26,26,26,0.05)] px-4 py-3">
        <div className="max-w-[460px] mx-auto">
          <button
            type="submit"
            form="checkout-form"
            className="w-full h-12 rounded-full bg-[#1A1A1A] text-[#FFFFFF] text-[14px] font-medium hover:bg-[#1A1A1A]/90 cursor-pointer"
          >
            Pay {formatNaira(product.priceNgn)} Safely →
          </button>
          <p className="mt-1.5 text-center text-[11px] text-[#5F6368]">
            Your money is held safely until you confirm delivery.
          </p>
        </div>
      </footer>
    </div>
  );
}
