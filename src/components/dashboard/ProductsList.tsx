"use client";

import Link from "next/link";
import { useState } from "react";
import { NairaAmount } from "@/components/NairaAmount";
import { ProductImage } from "@/components/ProductImage";
import { WhatsAppShareButton } from "@/components/WhatsAppShareButton";
import {
  buildWhatsAppShareUrl,
  formatDeliveryWindow,
} from "@/lib/format";

export interface ProductListItem {
  id: string;
  slug: string;
  name: string;
  imageUrl: string | null;
  priceNgn: string;
  windowMinutes: number;
  active: boolean;
  orderCount: number;
}

export function ProductsList({
  initialProducts,
  appUrl,
}: {
  initialProducts: ProductListItem[];
  appUrl: string;
}) {
  const [products, setProducts] = useState(initialProducts);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function handleCopy(product: ProductListItem) {
    const url = `${appUrl}/p/${product.slug}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(product.id);
    setTimeout(() => setCopiedId((prev) => (prev === product.id ? null : prev)), 2000);
  }

  async function handleToggleActive(product: ProductListItem) {
    setTogglingId(product.id);
    const nextActive = !product.active;
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: nextActive }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === product.id ? { ...p, active: nextActive } : p
          )
        );
      }
    } finally {
      setTogglingId(null);
    }
  }

  if (products.length === 0) {
    return (
      <section className="border border-[#E5E5E5] rounded-2xl p-10 bg-[#FFFFFF] flex flex-col items-center text-center">
        <p className="text-[15px] font-medium text-[#1A1A1A]">
          No pay links created yet
        </p>
        <p className="mt-1.5 text-[14px] text-[#5F6368] max-w-[380px]">
          Create a link for any product and drop it in WhatsApp or Instagram DMs.
        </p>
        <Link
          href="/dashboard/products/new"
          className="mt-5 h-10 px-5 rounded-full bg-[#1A1A1A] text-[#FFFFFF] text-[14px] font-medium inline-flex items-center hover:bg-[#1A1A1A]/90"
        >
          + Create your first pay link
        </Link>
      </section>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {products.map((product) => {
        const productUrl = `${appUrl}/p/${product.slug}`;
        const whatsappHref = buildWhatsAppShareUrl(
          product.name,
          product.priceNgn,
          productUrl
        );
        const isCopied = copiedId === product.id;

        return (
          <article
            key={product.id}
            className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl p-5 flex flex-col justify-between gap-4 hover:border-[#D4D4D4] hover:shadow-[0_6px_20px_rgba(26,26,26,0.04)] transition-all duration-200"
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#E5E5E5] shrink-0">
                <ProductImage
                  src={product.imageUrl}
                  alt={product.name}
                  placeholderLabel=""
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/p/${product.slug}`}
                    target="_blank"
                    className="text-[15px] font-medium text-[#1A1A1A] hover:underline line-clamp-2 leading-snug"
                  >
                    {product.name}
                  </Link>
                  <button
                    type="button"
                    disabled={togglingId === product.id}
                    onClick={() => handleToggleActive(product)}
                    title={
                      product.active
                        ? "Click to pause this pay link"
                        : "Click to activate this pay link"
                    }
                    className={`shrink-0 inline-flex items-center gap-1.5 font-mono text-[11px] px-2.5 py-0.5 rounded-full border cursor-pointer transition-colors ${
                      product.active
                        ? "bg-[#EBF7EE] text-[#1E6B3A] border-[#BBF7D0]"
                        : "bg-[#F2F0EB] text-[#5F6368] border-[#E5E5E5]"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        product.active ? "bg-[#1E6B3A]" : "bg-[#5F6368]"
                      }`}
                    />
                    {product.active ? "Active" : "Paused"}
                  </button>
                </div>

                <p className="mt-1 text-[20px] font-medium text-[#1A1A1A]">
                  <NairaAmount value={product.priceNgn} />
                </p>

                <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.06em] text-[#5F6368]">
                  {formatDeliveryWindow(product.windowMinutes)} window ·{" "}
                  {product.orderCount}{" "}
                  {product.orderCount === 1 ? "order" : "orders"}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E5E5E5] flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCopy(product)}
                className="flex-1 h-9 px-3 rounded-full bg-[#1A1A1A] text-[#FFFFFF] text-[13px] font-medium hover:bg-[#1A1A1A]/90 cursor-pointer whitespace-nowrap"
              >
                {isCopied ? "Copied!" : "Copy link"}
              </button>
              <WhatsAppShareButton
                href={whatsappHref}
                variant="outline"
                className="flex-1"
              />
              <Link
                href={`/p/${product.slug}`}
                target="_blank"
                aria-label={`Open ${product.name}`}
                title="Open pay link"
                className="w-9 h-9 shrink-0 rounded-full border border-[#E5E5E5] text-[#5F6368] hover:text-[#1A1A1A] hover:bg-[#F4F3EF] inline-flex items-center justify-center"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M7 17 17 7" />
                  <path d="M7 7h10v10" />
                </svg>
              </Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}
