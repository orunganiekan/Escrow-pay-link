"use client";

import Link from "next/link";
import { useState } from "react";
import { NairaAmount } from "@/components/NairaAmount";
import { ProductImage } from "@/components/ProductImage";
import { WhatsAppShareButton } from "@/components/WhatsAppShareButton";
import {
  buildWhatsAppShareUrl,
  DELIVERY_WINDOW_PRESETS,
  formatDeliveryWindow,
  formatNaira,
} from "@/lib/format";

interface CreatedProduct {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  priceNgn: string;
  windowMinutes: number;
}

export function CreateProductForm({ appUrl }: { appUrl: string }) {
  const [imageUrl, setImageUrl] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priceInput, setPriceInput] = useState("");
  const [windowMinutes, setWindowMinutes] = useState<number>(2880);
  const [isCustomWindow, setIsCustomWindow] = useState(false);
  const [customValue, setCustomValue] = useState("6");
  const [customUnit, setCustomUnit] = useState<"minutes" | "hours" | "days">(
    "hours"
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<CreatedProduct | null>(null);
  const [copied, setCopied] = useState(false);

  function getEffectiveWindowMinutes(): number {
    if (!isCustomWindow) return windowMinutes;
    const raw = Number(customValue);
    if (!Number.isFinite(raw) || raw <= 0) return 0;
    const multiplier =
      customUnit === "days" ? 1440 : customUnit === "hours" ? 60 : 1;
    return Math.round(raw * multiplier);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const parsedPrice = Number(priceInput.replace(/,/g, "").trim());
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setError("Enter a valid price greater than ₦0.");
      setLoading(false);
      return;
    }

    const effectiveWindow = getEffectiveWindowMinutes();
    if (effectiveWindow < 2 || effectiveWindow > 43200) {
      setError("Delivery window must be between 2 minutes and 30 days.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: description || undefined,
          imageUrl: imageUrl || undefined,
          priceNgn: parsedPrice,
          windowMinutes: effectiveWindow,
        }),
      });

      const data = (await res.json()) as {
        product?: CreatedProduct;
        error?: string;
      };

      if (!res.ok || !data.product) {
        setError(data.error || "Could not create pay link.");
        setLoading(false);
        return;
      }

      setCreated(data.product);
      setLoading(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Network error. Please try again."
      );
      setLoading(false);
    }
  }

  function resetForm() {
    setCreated(null);
    setImageUrl("");
    setName("");
    setDescription("");
    setPriceInput("");
    setWindowMinutes(2880);
    setError(null);
    setCopied(false);
  }

  if (created) {
    const shareUrl = `${appUrl}/p/${created.slug}`;
    const whatsappHref = buildWhatsAppShareUrl(
      created.name,
      created.priceNgn,
      shareUrl
    );
    const windowLabel = formatDeliveryWindow(created.windowMinutes);

    async function handleCopy() {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }

    return (
      <div className="max-w-[600px] bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl p-7 space-y-6">
        <div>
          <span className="inline-block font-mono text-[11px] uppercase tracking-[0.08em] text-[#1E6B3A] bg-[#EBF7EE] border border-[#BBF7D0] rounded-full px-3 py-1">
            PAY LINK READY
          </span>
          <h2 className="mt-3 text-[22px] font-semibold tracking-[-0.01em] text-[#1A1A1A]">
            {created.name}
          </h2>
          <p className="mt-1 text-[14px] text-[#5F6368]">
            Share this link in WhatsApp or Instagram DMs. Buyers can pay with
            zero signup.
          </p>
        </div>

        {/* Copyable URL Pill Bar */}
        <div className="flex items-center justify-between gap-3 bg-[#F8F6F1] border border-[#ECE8DF] rounded-full pl-5 pr-2 py-2">
          <span className="font-mono text-[13px] text-[#1A1A1A] truncate">
            {shareUrl}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="h-9 px-4 rounded-full bg-[#1A1A1A] text-[#FFFFFF] text-[13px] font-medium shrink-0 hover:bg-[#1A1A1A]/90 cursor-pointer"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        {/* Live WhatsApp Preview Mockup */}
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5F6368] mb-2.5">
            WHATSAPP LINK PREVIEW
          </p>
          <div className="rounded-2xl bg-[#F8F6F1] border border-[#ECE8DF] p-4">
            <div className="max-w-[340px] rounded-xl bg-[#FFFFFF] border border-[#E5E5E5] overflow-hidden">
              <div className="aspect-[16/10] w-full overflow-hidden border-b border-[#E5E5E5]">
                <ProductImage
                  src={created.imageUrl}
                  alt={created.name}
                  placeholderLabel="Link preview"
                />
              </div>
              <div className="p-3.5">
                <p className="text-[14px] font-medium text-[#1A1A1A] line-clamp-1">
                  {created.name} — {formatNaira(created.priceNgn)}
                </p>
                <p className="mt-0.5 text-[12px] text-[#5F6368]">
                  {windowLabel} delivery protection · EscrowPay
                </p>
                <p className="mt-1 font-mono text-[11px] text-[#5F6368] truncate">
                  {shareUrl}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <WhatsAppShareButton href={whatsappHref} variant="primary" />
          <Link
            href={`/p/${created.slug}`}
            target="_blank"
            className="h-11 px-5 rounded-full border border-[#E5E5E5] bg-[#FFFFFF] text-[#1A1A1A] text-[14px] font-medium inline-flex items-center hover:bg-[#F4F3EF]"
          >
            View link
          </Link>
          <button
            type="button"
            onClick={resetForm}
            className="h-11 px-4 text-[14px] font-medium text-[#5F6368] hover:text-[#1A1A1A] cursor-pointer"
          >
            Create another
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-[600px] bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl p-6 sm:p-7 space-y-5"
    >
      {/* Image URL + Live 16:10 Preview */}
      <div>
        <div className="aspect-[16/10] w-full rounded-xl overflow-hidden border border-[#E5E5E5] mb-3">
          <ProductImage
            src={imageUrl}
            alt={name || "Product preview"}
            placeholderLabel="Paste an image URL below to preview"
          />
        </div>
        <label
          htmlFor="imageUrl"
          className="block text-[13px] font-medium text-[#1A1A1A] mb-1.5"
        >
          Product Photo URL{" "}
          <span className="text-[#5F6368] font-normal">(optional)</span>
        </label>
        <input
          id="imageUrl"
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://images.unsplash.com/..."
          className="w-full h-11 px-3.5 rounded-xl bg-[#FFFFFF] border border-[#E5E5E5] text-[14px] text-[#1A1A1A] placeholder:text-[#5F6368]/60 focus:outline-none focus:border-[#1A1A1A]"
        />
      </div>

      {/* Product Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-[13px] font-medium text-[#1A1A1A] mb-1.5"
        >
          Product Name <span className="text-[#B42318]">*</span>
        </label>
        <input
          id="name"
          type="text"
          required
          minLength={2}
          maxLength={120}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Handcrafted Leather Tote Bag"
          className="w-full h-11 px-3.5 rounded-xl bg-[#FFFFFF] border border-[#E5E5E5] text-[14px] text-[#1A1A1A] placeholder:text-[#5F6368]/60 focus:outline-none focus:border-[#1A1A1A]"
        />
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-[13px] font-medium text-[#1A1A1A] mb-1.5"
        >
          Description{" "}
          <span className="text-[#5F6368] font-normal">(optional)</span>
        </label>
        <textarea
          id="description"
          rows={3}
          maxLength={500}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Color, size, or delivery notes for your buyer..."
          className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#E5E5E5] text-[14px] text-[#1A1A1A] placeholder:text-[#5F6368]/60 focus:outline-none focus:border-[#1A1A1A] resize-none"
        />
      </div>

      {/* Price in Naira */}
      <div>
        <label
          htmlFor="priceNgn"
          className="block text-[13px] font-medium text-[#1A1A1A] mb-1.5"
        >
          Price in Naira <span className="text-[#B42318]">*</span>
        </label>
        <div className="relative flex items-center">
          <span className="absolute left-3.5 text-[15px] text-[#5F6368] select-none">
            ₦
          </span>
          <input
            id="priceNgn"
            type="text"
            inputMode="decimal"
            required
            value={priceInput}
            onChange={(e) => setPriceInput(e.target.value)}
            placeholder="45000"
            className="w-full h-11 pl-8 pr-3.5 rounded-xl bg-[#FFFFFF] border border-[#E5E5E5] font-mono tabular-nums text-[15px] text-[#1A1A1A] placeholder:text-[#5F6368]/60 focus:outline-none focus:border-[#1A1A1A]"
          />
        </div>
        {priceInput && Number(priceInput.replace(/,/g, "")) > 0 ? (
          <p className="mt-1.5 text-[12px] text-[#5F6368]">
            Buyer pays{" "}
            <span className="text-[#1A1A1A] font-medium">
              <NairaAmount value={priceInput.replace(/,/g, "")} />
            </span>
          </p>
        ) : null}
      </div>

      {/* Delivery Window Selector */}
      <div>
        <span className="block text-[13px] font-medium text-[#1A1A1A] mb-2">
          Delivery Window
        </span>
        <div
          className="grid grid-cols-3 sm:inline-flex gap-1.5 bg-[#F8F6F1] p-1.5 rounded-2xl border border-[#ECE8DF]"
          role="radiogroup"
          aria-label="Delivery window"
        >
          {DELIVERY_WINDOW_PRESETS.map((preset) => {
            const selected = !isCustomWindow && windowMinutes === preset.minutes;
            return (
              <button
                key={preset.minutes}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => {
                  setIsCustomWindow(false);
                  setWindowMinutes(preset.minutes);
                }}
                className={`h-9 px-3 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selected
                    ? "bg-[#1A1A1A] text-[#FFFFFF]"
                    : "text-[#5F6368] hover:text-[#1A1A1A]"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
          <button
            type="button"
            role="radio"
            aria-checked={isCustomWindow}
            onClick={() => setIsCustomWindow(true)}
            className={`h-9 px-3 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
              isCustomWindow
                ? "bg-[#1A1A1A] text-[#FFFFFF]"
                : "text-[#5F6368] hover:text-[#1A1A1A]"
            }`}
          >
            Custom
          </button>
        </div>

        {isCustomWindow ? (
          <div className="mt-3 grid grid-cols-2 gap-3 max-w-[320px]">
            <input
              type="number"
              min={1}
              max={720}
              required
              aria-label="Custom delivery duration"
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              className="h-11 px-3.5 rounded-xl bg-[#FFFFFF] border border-[#E5E5E5] font-mono tabular-nums text-[14px] text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
            />
            <select
              aria-label="Custom delivery unit"
              value={customUnit}
              onChange={(e) =>
                setCustomUnit(e.target.value as "minutes" | "hours" | "days")
              }
              className="h-11 px-3 rounded-xl bg-[#FFFFFF] border border-[#E5E5E5] text-[14px] text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
            >
              <option value="minutes">Minutes</option>
              <option value="hours">Hours</option>
              <option value="days">Days</option>
            </select>
          </div>
        ) : null}

        <p className="mt-2 text-[12px] text-[#5F6368]">
          Buyer can claim an automatic refund if delivery isn&apos;t confirmed
          within this window.
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

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto h-12 px-7 rounded-full bg-[#1A1A1A] text-[#FFFFFF] text-[14px] font-medium hover:bg-[#1A1A1A]/90 disabled:opacity-60 cursor-pointer"
        >
          {loading ? "Creating Pay Link..." : "Create Pay Link →"}
        </button>
      </div>
    </form>
  );
}
