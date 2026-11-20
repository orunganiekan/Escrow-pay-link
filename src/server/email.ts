function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export type SendOtpResult =
  | { ok: true; mode: "resend" | "dev-console" }
  | { ok: false; error: string };

/**
 * Sends a 6-digit device verification OTP to the buyer's checkout email.
 * Uses Resend when RESEND_API_KEY is configured; falls back to server-console
 * output in local development so zero-SMTP environments remain testable.
 */
export async function sendBuyerOtpEmail(params: {
  to: string;
  orderCode: string;
  productName: string;
  otp: string;
  challengeId: string;
}): Promise<SendOtpResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    if (process.env.NODE_ENV !== "production") {
      console.info(
        `[DEV BUYER OTP] ${params.orderCode} (${params.to}) -> verification code: ${params.otp}`
      );
      return { ok: true, mode: "dev-console" };
    }
    return {
      ok: false,
      error:
        "Email verification is not configured yet. Please open this link on the browser you used at checkout.",
    };
  }

  const from =
    process.env.RESEND_FROM_EMAIL?.trim() || "EscrowPay <onboarding@resend.dev>";

  const safeOrderCode = escapeHtml(params.orderCode);
  const safeProduct = escapeHtml(params.productName);
  const spacedOtp = `${params.otp.slice(0, 3)} ${params.otp.slice(3)}`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #1A1A1A; background: #FFFFFF; border: 1px solid #E5E5E5; border-radius: 16px;">
      <p style="font-family: monospace; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: #5F6368; margin: 0 0 8px;">${safeOrderCode}</p>
      <h1 style="font-size: 20px; font-weight: 500; margin: 0 0 12px;">Verify your browser to view this order</h1>
      <p style="font-size: 14px; line-height: 1.5; color: #5F6368; margin: 0 0 20px;">
        Use this one-time code to unlock order controls and your release code for <strong style="color: #1A1A1A;">${safeProduct}</strong>. It expires in 10 minutes.
      </p>
      <div style="background: #F8F6F1; border: 1px solid #E5E5E5; border-radius: 12px; padding: 18px; text-align: center; margin-bottom: 20px;">
        <span style="font-family: monospace; font-size: 28px; font-weight: 600; letter-spacing: 0.2em; color: #1A1A1A;">${spacedOtp}</span>
      </div>
      <p style="font-size: 12px; line-height: 1.5; color: #5F6368; margin: 0;">
        If you didn&apos;t request this code, ignore this email and do not share it with anyone — including the seller.
      </p>
    </div>
  `.trim();

  const text = [
    `${params.orderCode} — Verify your browser`,
    "",
    `Your one-time verification code for ${params.productName}: ${params.otp}`,
    "This code expires in 10 minutes. Never share it with anyone.",
  ].join("\n");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `buyer-otp/${params.challengeId}`,
    },
    body: JSON.stringify({
      from,
      to: [params.to],
      subject: `${params.otp} is your EscrowPay verification code (${params.orderCode})`,
      html,
      text,
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    console.error("[sendBuyerOtpEmail] Resend failed:", response.status, errText);
    return {
      ok: false,
      error: "Could not send verification email right now. Please try again.",
    };
  }

  return { ok: true, mode: "resend" };
}
