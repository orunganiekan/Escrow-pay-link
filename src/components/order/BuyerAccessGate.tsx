"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SixDigitCodeInput } from "@/components/dashboard/SixDigitCodeInput";
import { postJson } from "@/lib/fetch-json";

export function BuyerAccessGate({
  token,
  maskedEmail,
}: {
  token: string;
  maskedEmail: string | null;
}) {
  const router = useRouter();
  const [step, setStep] = useState<"idle" | "sent">("idle");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  async function handleRequestOtp() {
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      const { ok, data } = await postJson<{
        ok?: boolean;
        alreadyVerified?: boolean;
        delivery?: "resend" | "dev-console";
        maskedEmail?: string | null;
        cooldownSeconds?: number;
        retryAfterSeconds?: number;
      }>(`/api/orders/${token}/access/request-otp`);

      if (!ok) {
        if (data.retryAfterSeconds) {
          setCooldown(data.retryAfterSeconds);
        }
        setError(data.error || "Could not send verification code.");
        setLoading(false);
        return;
      }

      if (data.alreadyVerified) {
        router.refresh();
        return;
      }

      setStep("sent");
      setCooldown(data.cooldownSeconds ?? 45);
      setInfo(
        data.delivery === "dev-console"
          ? "Local dev mode: check your server terminal for the 6-digit code."
          : `Sent a 6-digit code to ${data.maskedEmail || maskedEmail || "your email"}.`
      );
      setLoading(false);
    } catch {
      setError("Network error sending verification code.");
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 6) {
      setError("Enter all 6 digits from your verification email.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const { ok, data } = await postJson<{ ok?: boolean }>(
        `/api/orders/${token}/access/verify-otp`,
        { code }
      );
      if (!ok) {
        setError(data.error || "Invalid verification code.");
        setLoading(false);
        return;
      }
      router.refresh();
    } catch {
      setError("Network error verifying code.");
      setLoading(false);
    }
  }

  return (
    <div className="p-5 sm:p-6 border-b border-[#E5E5E5] space-y-4">
      <div className="space-y-1.5">
        <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5F6368]">
          DEVICE VERIFICATION
        </p>
        <h2 className="font-display font-medium text-[18px] text-[#1A1A1A] leading-snug">
          Verify your email to view this order
        </h2>
        <p className="text-[13px] text-[#5F6368] leading-relaxed">
          For your protection, release codes, delivery details, and refund
          controls are bound to the checkout browser.
          {maskedEmail
            ? ` Confirm with a 6-digit code sent to ${maskedEmail} to unlock this device.`
            : " Open this link on the browser you used at checkout."}
        </p>
      </div>

      {step === "idle" ? (
        <button
          type="button"
          disabled={loading || !maskedEmail}
          onClick={() => void handleRequestOtp()}
          className="w-full h-11 rounded-full bg-[#1A1A1A] text-[#FFFFFF] text-[14px] font-medium hover:bg-[#2E2E2E] active:scale-[0.985] disabled:opacity-60 transition-all cursor-pointer"
        >
          {loading ? "Sending code…" : "Send verification code"}
        </button>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-3.5">
          <SixDigitCodeInput
            value={code}
            onChange={setCode}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full h-11 rounded-full bg-[#1A1A1A] text-[#FFFFFF] text-[14px] font-medium hover:bg-[#2E2E2E] active:scale-[0.985] disabled:opacity-60 transition-all cursor-pointer"
          >
            {loading ? "Verifying…" : "Unlock Order"}
          </button>
          <div className="text-center">
            <button
              type="button"
              disabled={loading || cooldown > 0}
              onClick={() => void handleRequestOtp()}
              className="text-[12px] font-medium text-[#5F6368] hover:text-[#1A1A1A] disabled:opacity-50 cursor-pointer"
            >
              {cooldown > 0
                ? `Resend code in ${cooldown}s`
                : "Resend verification code"}
            </button>
          </div>
        </form>
      )}

      {info ? (
        <p className="rounded-lg bg-[#F8F6F1] border border-[#E5E5E5] px-3 py-2 text-[12px] text-[#5F6368]">
          {info}
        </p>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="rounded-lg bg-[#FDECEC] border border-[#FECACA] px-3 py-2 text-[12px] text-[#B42318]"
        >
          {error}
        </div>
      ) : null}
    </div>
  );
}
