import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getAppUrl } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { encrypt, generateReleaseCode, hashReleaseCode } from "@/server/crypto";
import { issueBuyerAccessCookie } from "@/server/orders/buyer-access";
import { initializePaystackTransaction } from "@/server/paystack";
import { createPrivyStellarAccount } from "@/server/stellar/accounts";
import { log } from "@/server/log";

export const maxDuration = 30;

const CreateOrderSchema = z.object({
  productId: z.string().trim().min(1),
  buyerName: z.string().trim().min(2, "Enter your full name.").max(100),
  buyerPhone: z.string().trim().min(7, "Enter a valid phone number.").max(30),
  buyerEmail: z.string().trim().email("Enter a valid email address.").max(120),
  street: z.string().trim().min(3, "Enter your street address.").max(160),
  city: z.string().trim().min(2, "Enter your city or area.").max(80),
  state: z.string().trim().min(2, "Select your state.").max(50),
  landmark: z.string().trim().max(120).optional(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const parsed = CreateOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid delivery details." },
      { status: 400 }
    );
  }

  const product = await prisma.product.findUnique({
    where: { id: parsed.data.productId },
    select: {
      id: true,
      slug: true,
      priceNgn: true,
      active: true,
    },
  });

  if (!product || !product.active) {
    return NextResponse.json(
      { error: "This pay link is unavailable." },
      { status: 404 }
    );
  }

  const token = crypto.randomBytes(16).toString("hex");
  const paystackReference = `epl_${crypto.randomBytes(10).toString("hex")}`;
  const releaseCode = generateReleaseCode();
  const codeHash = hashReleaseCode(releaseCode);
  const codeEnc = encrypt(releaseCode);

  const buyerEmail = parsed.data.buyerEmail;
  const buyerAddress = parsed.data.landmark
    ? `${parsed.data.street}, ${parsed.data.city}, ${parsed.data.state} · Landmark: ${parsed.data.landmark}`
    : `${parsed.data.street}, ${parsed.data.city}, ${parsed.data.state}`;
  const callbackUrl = `${getAppUrl()}/o/${token}?verify=1`;

  try {
    const [{ publicKey, privyWalletId }, paystack] = await Promise.all([
      createPrivyStellarAccount(),
      initializePaystackTransaction({
        amountNgn: product.priceNgn.toString(),
        email: buyerEmail,
        reference: paystackReference,
        callbackUrl,
        metadata: {
          productId: product.id,
          slug: product.slug,
          orderToken: token,
        },
      }),
    ]);

    const createdOrder = await prisma.order.create({
      data: {
        token,
        productId: product.id,
        buyerName: parsed.data.buyerName,
        buyerPhone: parsed.data.buyerPhone,
        buyerEmail,
        buyerAddress,
        amountNgn: product.priceNgn,
        status: "PENDING_PAYMENT",
        paystackReference: paystack.reference,
        paystackAuthorizationUrl: paystack.authorizationUrl,
        codeHash,
        codeEnc,
        buyerStellarPublic: publicKey,
        buyerPrivyWalletId: privyWalletId,
      },
      select: { id: true, token: true },
    });

    const response = NextResponse.json(
      {
        token,
        redirectUrl: `/o/${token}`,
        authorizationUrl: paystack.authorizationUrl,
      },
      { status: 201 }
    );
    issueBuyerAccessCookie(response, createdOrder);
    return response;
  } catch (err) {
    log.error("order.checkout.init_failed", { productId: product.id }, err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Could not initialize checkout. Please try again.",
      },
      { status: 502 }
    );
  }
}
