import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  clearOtpChallengeCookie,
  hasBuyerOrderAccess,
  issueBuyerAccessCookie,
  readOtpChallenge,
  setOtpChallengeCookie,
  verifyBuyerOtpHash,
} from "@/server/orders/buyer-access";

const VerifyOtpSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter the 6-digit verification code."),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ token: string }> }
) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const parsed = VerifyOtpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid verification code." },
      { status: 400 }
    );
  }

  const { token } = await context.params;
  const order = await prisma.order.findUnique({
    where: { token },
    select: { id: true, token: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  if (await hasBuyerOrderAccess(order)) {
    return NextResponse.json({ ok: true });
  }

  const challenge = await readOtpChallenge(order);
  if (!challenge) {
    return NextResponse.json(
      {
        error:
          "Verification code expired or missing. Request a new code to continue.",
      },
      { status: 400 }
    );
  }

  if (!verifyBuyerOtpHash(order.id, parsed.data.code, challenge.otpHash)) {
    const nextAttempts = Math.max(0, challenge.attemptsRemaining - 1);
    if (nextAttempts <= 0) {
      const locked = NextResponse.json(
        {
          error:
            "Too many incorrect attempts. Request a new verification code.",
          attemptsRemaining: 0,
        },
        { status: 423 }
      );
      clearOtpChallengeCookie(locked, order.token);
      return locked;
    }

    const failed = NextResponse.json(
      {
        error: `Incorrect code. ${nextAttempts} ${
          nextAttempts === 1 ? "attempt" : "attempts"
        } remaining.`,
        attemptsRemaining: nextAttempts,
      },
      { status: 400 }
    );
    setOtpChallengeCookie(failed, {
      ...challenge,
      attemptsRemaining: nextAttempts,
    });
    return failed;
  }

  const response = NextResponse.json({ ok: true });
  clearOtpChallengeCookie(response, order.token);
  issueBuyerAccessCookie(response, order);
  return response;
}
