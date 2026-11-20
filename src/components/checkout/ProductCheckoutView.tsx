"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { NairaAmount } from "@/components/NairaAmount";
import { ProductImage } from "@/components/ProductImage";
import { postJson } from "@/lib/fetch-json";
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

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
  "FCT - Abuja", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina",
  "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo",
  "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

export function ProductCheckoutView({
  product,
}: {
  product: PublicProductData;
}) {
  const router = useRouter();
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("Lagos");
  const [landmark, setLandmark] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const { ok, data } = await postJson<{ redirectUrl?: string }>(
        "/api/orders",
        {
          productId: product.id,
          buyerName,
          buyerPhone,
          buyerEmail,
          street,
          city,
          state,
          landmark: landmark || undefined,
        }
      );

      if (!ok || !data.redirectUrl) {
        setError(data.error || "Could not start checkout. Please try again.");
        setSubmitting(false);
        return;
      }

      router.push(data.redirectUrl);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Network error. Please try again."
      );
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] md:bg-[#F8F6F1] flex flex-col">
      {/* Minimal Top Bar */}
      <header className="w-full border-b border-[#E5E5E5] bg-[#FFFFFF]/95 backdrop-blur sticky top-0 z-20">
        <div className="max-w-[460px] lg:max-w-[1040px] mx-auto px-4 lg:px-8 h-14 lg:h-16 flex items-center justify-between">
          <Link
            href="/"
            className="text-[15px] lg:text-[16px] font-semibold tracking-tight text-[#1A1A1A]"
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

      <main className="flex-1 w-full max-w-[460px] lg:max-w-[1040px] mx-auto px-4 lg:px-8 pt-5 md:pt-8 lg:py-10 pb-32 lg:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start">
          {/* Left Column: Product Showcase + Seller Trust */}
          <div className="lg:col-span-6 lg:sticky lg:top-24 space-y-4">
            {/* Product Hero Card */}
            <section className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl overflow-hidden md:shadow-[0_8px_28px_rgba(26,26,26,0.04)] animate-fade-up">
              <div className="aspect-[4/3] w-full overflow-hidden border-b border-[#E5E5E5] bg-[#FAF9F7]">
                <ProductImage
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-contain p-3 lg:p-5"
                  placeholderLabel="Product photo"
                />
              </div>

              <div className="p-5 lg:p-6">
                <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5F6368]">
                  {windowEyebrow}
                </p>
                <h1 className="mt-1.5 text-[20px] lg:text-[24px] font-medium text-[#1A1A1A] leading-snug">
                  {product.name}
                </h1>
                {product.description ? (
                  <p className="mt-2 text-[14px] text-[#5F6368] leading-relaxed line-clamp-3 lg:line-clamp-none">
                    {product.description}
                  </p>
                ) : null}
                <p className="mt-3.5 text-[28px] lg:text-[32px] font-medium tracking-[-0.02em] text-[#1A1A1A]">
                  <NairaAmount value={product.priceNgn} />
                </p>
              </div>
            </section>

            {/* Earned Seller Trust Strip */}
            <section className="bg-[#F8F6F1] lg:bg-[#FFFFFF] border border-[#ECE8DF] lg:border-[#E5E5E5] rounded-xl lg:rounded-2xl p-3.5 lg:p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-8 h-8 rounded-full bg-[#FFFFFF] lg:bg-[#F8F6F1] border border-[#E5E5E5] flex items-center justify-center text-[12px] font-medium text-[#1A1A1A] shrink-0">
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

            {/* Desktop-Only Quiet Escrow Guarantees */}
            <section className="hidden lg:grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-[#FFFFFF] border border-[#E5E5E5] p-3.5">
                <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#8A5A00]">
                  HELD SAFELY
                </p>
                <p className="mt-1 text-[12px] text-[#5F6368] leading-snug">
                  Seller isn&apos;t paid until delivery is confirmed.
                </p>
              </div>
              <div className="rounded-xl bg-[#FFFFFF] border border-[#E5E5E5] p-3.5">
                <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#1A1A1A]">
                  6-DIGIT CODE
                </p>
                <p className="mt-1 text-[12px] text-[#5F6368] leading-snug">
                  Share your code only when the item is in your hands.
                </p>
              </div>
              <div className="rounded-xl bg-[#FFFFFF] border border-[#E5E5E5] p-3.5">
                <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#1E6B3A]">
                  AUTO REFUND
                </p>
                <p className="mt-1 text-[12px] text-[#5F6368] leading-snug">
                  Claim a full refund if the delivery window expires.
                </p>
              </div>
            </section>
          </div>

          {/* Right Column: Zero-Signup Delivery Form */}
          <form
            id="checkout-form"
            onSubmit={handleSubmit}
            className="lg:col-span-6 bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl p-5 lg:p-7 md:shadow-[0_8px_28px_rgba(26,26,26,0.04)] space-y-3.5 animate-fade-up"
            style={{ animationDelay: "70ms" }}
          >
            <div className="pb-2 border-b border-[#E5E5E5] hidden lg:block">
              <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5F6368]">
                ZERO-SIGNUP CHECKOUT
              </p>
              <h2 className="mt-1 text-[18px] font-medium text-[#1A1A1A]">
                Where should we deliver?
              </h2>
            </div>

            <p className="lg:hidden font-mono text-[11px] uppercase tracking-[0.08em] text-[#5F6368]">
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
              htmlFor="buyerEmail"
              className="block text-[13px] font-medium text-[#1A1A1A] mb-1"
            >
              Email Address <span className="text-[#B42318]">*</span>
            </label>
            <input
              id="buyerEmail"
              type="email"
              required
              autoComplete="email"
              value={buyerEmail}
              onChange={(e) => setBuyerEmail(e.target.value)}
              placeholder="amaka@example.com"
              className="w-full h-11 px-3.5 rounded-xl bg-[#FFFFFF] border border-[#E5E5E5] text-[14px] text-[#1A1A1A] placeholder:text-[#5F6368]/60 focus:outline-none focus:border-[#1A1A1A]"
            />
            <p className="mt-1 text-[11px] text-[#5F6368]">
              For your Paystack receipt and order tracking link.
            </p>
          </div>

          <div className="pt-2 border-t border-[#E5E5E5] space-y-3">
            <div>
              <label
                htmlFor="street"
                className="block text-[13px] font-medium text-[#1A1A1A] mb-1"
              >
                Street Address <span className="text-[#B42318]">*</span>
              </label>
              <input
                id="street"
                type="text"
                required
                autoComplete="street-address"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="14 Admiralty Way"
                className="w-full h-11 px-3.5 rounded-xl bg-[#FFFFFF] border border-[#E5E5E5] text-[14px] text-[#1A1A1A] placeholder:text-[#5F6368]/60 focus:outline-none focus:border-[#1A1A1A]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="city"
                  className="block text-[13px] font-medium text-[#1A1A1A] mb-1"
                >
                  City / Area <span className="text-[#B42318]">*</span>
                </label>
                <input
                  id="city"
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Lekki Phase 1"
                  className="w-full h-11 px-3.5 rounded-xl bg-[#FFFFFF] border border-[#E5E5E5] text-[14px] text-[#1A1A1A] placeholder:text-[#5F6368]/60 focus:outline-none focus:border-[#1A1A1A]"
                />
              </div>

              <div>
                <label
                  htmlFor="state"
                  className="block text-[13px] font-medium text-[#1A1A1A] mb-1"
                >
                  State <span className="text-[#B42318]">*</span>
                </label>
                <select
                  id="state"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-[#FFFFFF] border border-[#E5E5E5] text-[14px] text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                >
                  {NIGERIAN_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="landmark"
                className="block text-[13px] font-medium text-[#1A1A1A] mb-1"
              >
                Landmark / Delivery Notes{" "}
                <span className="text-[#5F6368] font-normal">(optional)</span>
              </label>
              <input
                id="landmark"
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="Opposite Mega Chicken, call on arrival"
                className="w-full h-11 px-3.5 rounded-xl bg-[#FFFFFF] border border-[#E5E5E5] text-[14px] text-[#1A1A1A] placeholder:text-[#5F6368]/60 focus:outline-none focus:border-[#1A1A1A]"
              />
            </div>
          </div>

          <p className="pt-1 text-[12px] text-[#5F6368] leading-relaxed">
            No account or password needed. After paying, keep your order link
            to view your release code.
          </p>

          {error ? (
            <div
              role="alert"
              className="rounded-xl bg-[#FDECEC] border border-[#FECACA] px-3.5 py-2.5 text-[13px] text-[#B42318]"
            >
              {error}
            </div>
          ) : null}

          {/* Desktop Embedded CTA */}
          <div className="hidden lg:block pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-12 rounded-full bg-[#1A1A1A] text-[#FFFFFF] text-[14px] font-medium hover:bg-[#1A1A1A]/90 active:scale-[0.985] transition-all disabled:opacity-60 cursor-pointer"
            >
              {submitting
                ? "Preparing safe checkout..."
                : `Pay ${formatNaira(product.priceNgn)} Safely →`}
            </button>
            <p className="mt-2 text-center text-[12px] text-[#5F6368]">
              Your money is held safely until you confirm delivery.
            </p>
          </div>
        </form>
        </div>
      </main>

      {/* Mobile Sticky Bottom CTA Bar */}
      <footer className="lg:hidden fixed bottom-0 inset-x-0 z-20 bg-[#FFFFFF] border-t border-[#E5E5E5] shadow-[0_-6px_20px_rgba(26,26,26,0.05)] px-4 py-3">
        <div className="max-w-[460px] mx-auto">
          <button
            type="submit"
            form="checkout-form"
            disabled={submitting}
            className="w-full h-12 rounded-full bg-[#1A1A1A] text-[#FFFFFF] text-[14px] font-medium hover:bg-[#1A1A1A]/90 active:scale-[0.985] transition-all disabled:opacity-60 cursor-pointer"
          >
            {submitting
              ? "Preparing safe checkout..."
              : `Pay ${formatNaira(product.priceNgn)} Safely →`}
          </button>
          <p className="mt-1.5 text-center text-[11px] text-[#5F6368]">
            Your money is held safely until you confirm delivery.
          </p>
        </div>
      </footer>
    </div>
  );
}
