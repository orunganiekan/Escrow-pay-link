import crypto from "node:crypto";

const PAYSTACK_API_BASE = "https://api.paystack.co";

function getPaystackSecret(): string {
  const key = process.env.PAYSTACK_SECRET_KEY?.trim();
  if (!key) {
    throw new Error("Missing PAYSTACK_SECRET_KEY environment variable.");
  }
  return key;
}

/**
 * Converts a Naira decimal string or number into integer kobo.
 */
export function toKobo(amountNgn: string | number): number {
  const num = typeof amountNgn === "number" ? amountNgn : Number(amountNgn);
  if (!Number.isFinite(num) || num <= 0) {
    throw new Error(`Invalid NGN amount: "${amountNgn}"`);
  }
  return Math.round(num * 100);
}

interface PaystackInitializeParams {
  amountNgn: string | number;
  email: string;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}

interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

/**
 * Initializes a Paystack NGN checkout session (Bank Transfer, Card, USSD).
 */
export async function initializePaystackTransaction(
  params: PaystackInitializeParams
): Promise<{ authorizationUrl: string; reference: string }> {
  const res = await fetch(`${PAYSTACK_API_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getPaystackSecret()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: toKobo(params.amountNgn),
      currency: "NGN",
      email: params.email,
      reference: params.reference,
      channels: ["bank_transfer", "card", "ussd"],
      callback_url: params.callbackUrl,
      metadata: params.metadata,
    }),
  });

  const json = (await res.json()) as PaystackInitializeResponse;
  if (!res.ok || !json.status || !json.data?.authorization_url) {
    throw new Error(
      `Paystack initialize failed (${res.status}): ${json.message || "Unknown error"}`
    );
  }

  return {
    authorizationUrl: json.data.authorization_url,
    reference: json.data.reference,
  };
}

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data?: {
    status: string;
    reference: string;
    amount: number;
    currency: string;
  };
}

/**
 * Verifies a Paystack transaction directly with Paystack's API.
 */
export async function verifyPaystackTransaction(reference: string): Promise<{
  status: string;
  reference: string;
  amount: number;
  currency: string;
}> {
  const res = await fetch(
    `${PAYSTACK_API_BASE}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getPaystackSecret()}`,
      },
      cache: "no-store",
    }
  );

  const json = (await res.json()) as PaystackVerifyResponse;
  if (!res.ok || !json.status || !json.data) {
    throw new Error(
      `Paystack verify failed (${res.status}): ${json.message || "Unknown error"}`
    );
  }

  return {
    status: json.data.status,
    reference: json.data.reference,
    amount: json.data.amount,
    currency: json.data.currency,
  };
}

/**
 * Verifies Paystack's x-paystack-signature (HMAC-SHA512 over the raw request body).
 */
export function verifyPaystackWebhookSignature(
  rawBody: string,
  signatureHeader: string | null
): boolean {
  if (!signatureHeader) return false;
  const expected = crypto
    .createHmac("sha512", getPaystackSecret())
    .update(rawBody, "utf8")
    .digest("hex");

  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(signatureHeader.trim(), "hex");
  if (a.length === 0 || a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
