import nodemailer, { type Transporter } from "nodemailer";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export type SendOtpResult =
  | { ok: true; mode: "gmail-smtp" | "resend" | "dev-console" }
  | { ok: false; error: string };

const NOT_CONFIGURED_ERROR =
  "Email verification is not configured yet. Please open this link on the browser you used at checkout.";
const SEND_FAILED_ERROR = "Could not send verification email right now. Please try again.";

type OutgoingEmail = { to: string; subject: string; html: string; text: string };
type Transport =
  | { kind: "gmail-smtp"; user: string; pass: string }
  | { kind: "resend"; apiKey: string; from: string }
  | { kind: "dev-console" }
  | { kind: "none" };

/**
 * Picks the outgoing email provider:
 *   1. Gmail SMTP (GMAIL_SMTP_USER + GMAIL_SMTP_APP_PASSWORD)
 *   2. Resend (RESEND_API_KEY, with RESEND_FROM_EMAIL on a verified domain in production)
 *   3. Server-console output — local development only, never in production.
 */
function resolveTransport(): Transport {
  const isProduction = process.env.NODE_ENV === "production";

  const gmailUser = process.env.GMAIL_SMTP_USER?.trim();
  const gmailPass = process.env.GMAIL_SMTP_APP_PASSWORD?.replace(/\s+/g, "");
  if (gmailUser && gmailPass) {
    return { kind: "gmail-smtp", user: gmailUser, pass: gmailPass };
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (apiKey) {
    const configuredFrom = process.env.RESEND_FROM_EMAIL?.trim();
    // Resend's shared onboarding@resend.dev sender only delivers to the Resend
    // account owner, so in production it would silently lock real buyers out.
    if (isProduction && (!configuredFrom || /@resend\.dev>?$/i.test(configuredFrom))) {
      console.error(
        "[email] RESEND_FROM_EMAIL must use a verified custom domain in production."
      );
      return { kind: "none" };
    }
    return {
      kind: "resend",
      apiKey,
      from: configuredFrom || "EscrowPay <onboarding@resend.dev>",
    };
  }

  return isProduction ? { kind: "none" } : { kind: "dev-console" };
}

let gmailTransporter: Transporter | null = null;

async function sendViaGmail(
  transport: Extract<Transport, { kind: "gmail-smtp" }>,
  email: OutgoingEmail
): Promise<boolean> {
  gmailTransporter ??= nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: transport.user, pass: transport.pass },
  });
  try {
    await gmailTransporter.sendMail({
      from: `EscrowPay <${transport.user}>`,
      to: email.to,
      subject: email.subject,
      html: email.html,
      text: email.text,
    });
    return true;
  } catch (err) {
    console.error("[email] Gmail SMTP send failed:", err);
    return false;
  }
}

async function sendViaResend(
  transport: Extract<Transport, { kind: "resend" }>,
  email: OutgoingEmail,
  idempotencyKey: string
): Promise<boolean> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${transport.apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify({
      from: transport.from,
      to: [email.to],
      subject: email.subject,
      html: email.html,
      text: email.text,
    }),
  });
  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    console.error("[email] Resend send failed:", response.status, errText);
    return false;
  }
  return true;
}

/**
 * Sends a 6-digit device verification OTP to the buyer's checkout email.
 */
export async function sendBuyerOtpEmail(params: {
  to: string;
  orderCode: string;
  productName: string;
  otp: string;
  challengeId: string;
}): Promise<SendOtpResult> {
  const transport = resolveTransport();

  if (transport.kind === "none") {
    return { ok: false, error: NOT_CONFIGURED_ERROR };
  }

  if (transport.kind === "dev-console") {
    console.info(
      `[DEV BUYER OTP] ${params.orderCode} (${params.to}) -> verification code: ${params.otp}`
    );
    return { ok: true, mode: "dev-console" };
  }

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

  const email: OutgoingEmail = {
    to: params.to,
    subject: `${params.otp} is your EscrowPay verification code (${params.orderCode})`,
    html,
    text,
  };

  const sent =
    transport.kind === "gmail-smtp"
      ? await sendViaGmail(transport, email)
      : await sendViaResend(transport, email, `buyer-otp/${params.challengeId}`);

  return sent ? { ok: true, mode: transport.kind } : { ok: false, error: SEND_FAILED_ERROR };
}
