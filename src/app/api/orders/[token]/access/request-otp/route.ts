import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateReleaseCode } from "@/server/crypto";
import { sendBuyerOtpEmail } from "@/server/email";
import {
  OTP_RESEND_COOLDOWN_MS,
  createOtpChallenge,
  hasBuyerOrderAccess,
  maskEmail,
  readOtpChallenge,
  setOtpChallengeCookie,
} from "@/server/orders/buyer-access";

export async function POST(
  _request: Request,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;

  const order = await prisma.order.findUnique({
    where: { token },
    select: {
      id: true,
      token: true,
      buyerEmail: true,
      product: { select: { name: true } },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  if (await hasBuyerOrderAccess({ id: order.id, token: order.token })) {
    return NextResponse.json({ ok: true, alreadyVerified: true });
  }

  if (!order.buyerEmail) {
    return NextResponse.json(
      { error: "No email address is registered on this order." },
      { status: 400 }
    );
  }

  const existing = await readOtpChallenge({ id: order.id, token: order.token });
  if (existing) {
    const elapsed = Date.now() - existing.lastSentAt;
    if (elapsed < OTP_RESEND_COOLDOWN_MS) {
      const retryAfterSeconds = Math.ceil(
        (OTP_RESEND_COOLDOWN_MS - elapsed) / 1000
      );
      return NextResponse.json(
        {
          error: `Please wait ${retryAfterSeconds}s before requesting another code.`,
          retryAfterSeconds,
        },
        { status: 429 }
      );
    }
  }

  const otp = generateReleaseCode();
  const shortOrderCode = `ORDER #EPL-${order.id.slice(-4).toUpperCase()}`;
  const challengeId = `${order.id}-${crypto.randomBytes(6).toString("hex")}`;

  const sent = await sendBuyerOtpEmail({
    to: order.buyerEmail,
    orderCode: shortOrderCode,
    productName: order.product.name,
    otp,
    challengeId,
  });

  if (!sent.ok) {
    return NextResponse.json({ error: sent.error }, { status: 503 });
  }

  const challenge = createOtpChallenge({
    orderId: order.id,
    token: order.token,
    otp,
  });

  const response = NextResponse.json({
    ok: true,
    delivery: sent.mode,
    maskedEmail: maskEmail(order.buyerEmail),
    cooldownSeconds: Math.ceil(OTP_RESEND_COOLDOWN_MS / 1000),
  });
  setOtpChallengeCookie(response, challenge);
  return response;
}
