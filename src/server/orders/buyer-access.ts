import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import {
  constantTimeEqualHex,
  decrypt,
  encrypt,
  hmacSha256Hex,
} from "@/server/crypto";

const ACCESS_MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
export const OTP_RESEND_COOLDOWN_MS = 45 * 1000;
export const MAX_OTP_ATTEMPTS = 5;

export interface BuyerOtpChallenge {
  orderId: string;
  token: string;
  otpHash: string;
  exp: number;
  attemptsRemaining: number;
  lastSentAt: number;
}

function getAccessCookieName(token: string): string {
  return `epl_ob_${token.slice(0, 12)}`;
}

function getOtpCookieName(token: string): string {
  return `epl_otp_${token.slice(0, 12)}`;
}

function signBuyerAccess(
  orderId: string,
  token: string,
  issuedAtMs: number
): string {
  const sig = hmacSha256Hex(
    "buyer-access",
    `${orderId}:${token}:${issuedAtMs}`
  );
  return `${issuedAtMs}.${sig}`;
}

/**
 * Binds the current browser to an order using an HttpOnly HMAC-signed cookie.
 */
export function issueBuyerAccessCookie(
  response: NextResponse,
  order: { id: string; token: string }
): void {
  const issuedAtMs = Date.now();
  response.cookies.set(
    getAccessCookieName(order.token),
    signBuyerAccess(order.id, order.token, issuedAtMs),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: ACCESS_MAX_AGE_SECONDS,
    }
  );
}

/**
 * Verifies whether the current request carries a valid device-bound buyer cookie for this order.
 */
export async function hasBuyerOrderAccess(order: {
  id: string;
  token: string;
}): Promise<boolean> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(getAccessCookieName(order.token))?.value;
  if (!raw) return false;

  const [issuedAtRaw, providedSig] = raw.split(".");
  if (!issuedAtRaw || !providedSig) return false;

  const issuedAtMs = Number(issuedAtRaw);
  if (
    !Number.isFinite(issuedAtMs) ||
    issuedAtMs <= 0 ||
    Date.now() - issuedAtMs > ACCESS_MAX_AGE_SECONDS * 1000
  ) {
    return false;
  }

  const expectedSig = hmacSha256Hex(
    "buyer-access",
    `${order.id}:${order.token}:${issuedAtMs}`
  );
  return constantTimeEqualHex(providedSig, expectedSig);
}

export function hashBuyerOtp(orderId: string, otp: string): string {
  return hmacSha256Hex("buyer-otp", `${orderId}:${otp.trim()}`);
}

export function verifyBuyerOtpHash(
  orderId: string,
  candidateOtp: string,
  expectedHash: string
): boolean {
  return constantTimeEqualHex(hashBuyerOtp(orderId, candidateOtp), expectedHash);
}

export function createOtpChallenge(params: {
  orderId: string;
  token: string;
  otp: string;
}): BuyerOtpChallenge {
  const now = Date.now();
  return {
    orderId: params.orderId,
    token: params.token,
    otpHash: hashBuyerOtp(params.orderId, params.otp),
    exp: now + OTP_TTL_MS,
    attemptsRemaining: MAX_OTP_ATTEMPTS,
    lastSentAt: now,
  };
}

export async function readOtpChallenge(order: {
  id: string;
  token: string;
}): Promise<BuyerOtpChallenge | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(getOtpCookieName(order.token))?.value;
  if (!raw) return null;

  try {
    const parsed = JSON.parse(decrypt(raw)) as Partial<BuyerOtpChallenge>;
    if (
      parsed.orderId !== order.id ||
      parsed.token !== order.token ||
      typeof parsed.otpHash !== "string" ||
      typeof parsed.exp !== "number" ||
      typeof parsed.attemptsRemaining !== "number" ||
      typeof parsed.lastSentAt !== "number"
    ) {
      return null;
    }
    if (parsed.exp <= Date.now() || parsed.attemptsRemaining <= 0) {
      return null;
    }
    return parsed as BuyerOtpChallenge;
  } catch {
    return null;
  }
}

export function setOtpChallengeCookie(
  response: NextResponse,
  challenge: BuyerOtpChallenge
): void {
  const ttlSeconds = Math.max(
    1,
    Math.ceil((challenge.exp - Date.now()) / 1000)
  );
  response.cookies.set(
    getOtpCookieName(challenge.token),
    encrypt(JSON.stringify(challenge)),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: ttlSeconds,
    }
  );
}

export function clearOtpChallengeCookie(
  response: NextResponse,
  token: string
): void {
  response.cookies.set(getOtpCookieName(token), "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

/**
 * Masks an email address (e.g. "k***@y***o.com") for unverified device prompts.
 */
export function maskEmail(email: string | null | undefined): string | null {
  if (!email || !email.includes("@")) return null;
  const [local, domain] = email.split("@");
  if (!local || !domain) return null;

  const maskedLocal =
    local.length <= 2 ? `${local[0]}***` : `${local.slice(0, 2)}***`;

  const dotIdx = domain.lastIndexOf(".");
  if (dotIdx <= 0) {
    return `${maskedLocal}@${domain[0]}***`;
  }

  const host = domain.slice(0, dotIdx);
  const tld = domain.slice(dotIdx);
  const maskedHost =
    host.length <= 2 ? `${host[0]}***` : `${host[0]}***${host.slice(-1)}`;

  return `${maskedLocal}@${maskedHost}${tld}`;
}
