"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthCardShell } from "@/components/auth/AuthCard";

export function OnboardingForm({ email }: { email: string }) {
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [instagram, setInstagram] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/vendor/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          whatsapp: whatsapp || undefined,
          instagram: instagram || undefined,
        }),
      });

      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Could not complete store setup.");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Network error while creating store."
      );
      setLoading(false);
    }
  }

  return (
    <AuthCardShell
      eyebrow="STEP 1 OF 1 · STORE SETUP"
      title="Set up your seller profile"
      subtitle={`Signed in as ${email}. Buyers will see your store name and completion record at checkout.`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="businessName"
            className="block text-[13px] font-medium text-[#1A1A1A] mb-1.5"
          >
            Business / Store Name <span className="text-[#B42318]">*</span>
          </label>
          <input
            id="businessName"
            type="text"
            required
            minLength={2}
            maxLength={80}
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="e.g. Kemi's Leather Studio"
            className="w-full h-11 px-3.5 rounded-xl bg-[#FFFFFF] border border-[#E5E5E5] text-[14px] text-[#1A1A1A] placeholder:text-[#5F6368]/60 focus:outline-none focus:border-[#1A1A1A] transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="whatsapp"
            className="block text-[13px] font-medium text-[#1A1A1A] mb-1.5"
          >
            WhatsApp Number{" "}
            <span className="text-[#5F6368] font-normal">(optional)</span>
          </label>
          <input
            id="whatsapp"
            type="tel"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="e.g. 0803 123 4567"
            className="w-full h-11 px-3.5 rounded-xl bg-[#FFFFFF] border border-[#E5E5E5] text-[14px] text-[#1A1A1A] placeholder:text-[#5F6368]/60 focus:outline-none focus:border-[#1A1A1A] transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="instagram"
            className="block text-[13px] font-medium text-[#1A1A1A] mb-1.5"
          >
            Instagram Handle{" "}
            <span className="text-[#5F6368] font-normal">(optional)</span>
          </label>
          <input
            id="instagram"
            type="text"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="e.g. @kemisleather"
            className="w-full h-11 px-3.5 rounded-xl bg-[#FFFFFF] border border-[#E5E5E5] text-[14px] text-[#1A1A1A] placeholder:text-[#5F6368]/60 focus:outline-none focus:border-[#1A1A1A] transition-colors"
          />
        </div>

        {error ? (
          <div
            role="alert"
            className="rounded-xl bg-[#FDECEC] border border-[#FECACA] px-3.5 py-2.5 text-[13px] text-[#B42318]"
          >
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-full bg-[#1A1A1A] text-[#FFFFFF] text-[14px] font-medium hover:bg-[#1A1A1A]/90 disabled:opacity-60 transition-opacity cursor-pointer"
        >
          {loading ? "Preparing your store account..." : "Create Store & Continue →"}
        </button>
      </form>
    </AuthCardShell>
  );
}
