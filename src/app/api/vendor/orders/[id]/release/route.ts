import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedVendor } from "@/lib/vendor";
import { verifyReleaseCode } from "@/server/crypto";
import { escrowService } from "@/server/stellar/escrow";

export const maxDuration = 30;

const MAX_RELEASE_ATTEMPTS = 5;

const ReleaseSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter the 6-digit release code."),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const vendor = await getAuthenticatedVendor();
  if (!vendor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const parsed = ReleaseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid release code." },
      { status: 400 }
    );
  }

  const { id } = await context.params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { product: { select: { vendorId: true } } },
  });

  if (!order || order.product.vendorId !== vendor.id) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  if (order.status !== "SECURED" && order.status !== "SHIPPED") {
    return NextResponse.json(
      {
        error:
          order.status === "DISPUTED"
            ? "Release is frozen while this order is disputed."
            : "This order cannot be released in its current state.",
      },
      { status: 400 }
    );
  }

  if (order.releaseAttempts >= MAX_RELEASE_ATTEMPTS) {
    return NextResponse.json(
      {
        error: "Release locked after 5 incorrect attempts.",
        attemptsRemaining: 0,
      },
      { status: 423 }
    );
  }

  if (!order.deadline || order.deadline.getTime() <= Date.now()) {
    return NextResponse.json(
      { error: "Delivery window has expired; buyer refund is now active." },
      { status: 400 }
    );
  }

  if (!order.claimableBalanceId) {
    return NextResponse.json(
      { error: "Missing escrow claimable balance." },
      { status: 400 }
    );
  }

  if (!verifyReleaseCode(parsed.data.code, order.codeHash)) {
    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { releaseAttempts: { increment: 1 } },
      select: { releaseAttempts: true },
    });
    const attemptsRemaining = Math.max(
      0,
      MAX_RELEASE_ATTEMPTS - updated.releaseAttempts
    );
    return NextResponse.json(
      {
        error:
          attemptsRemaining > 0
            ? `Incorrect code. ${attemptsRemaining} ${
                attemptsRemaining === 1 ? "attempt" : "attempts"
              } remaining.`
            : "Incorrect code. Release locked after 5 attempts.",
        attemptsRemaining,
      },
      { status: 400 }
    );
  }

  try {
    const { txHash } = await escrowService.release({
      claimableBalanceId: order.claimableBalanceId,
      vendorPublicKey: vendor.stellarPublic,
      amountNgn: order.amountNgn.toString(),
    });

    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "RELEASED",
        txRelease: txHash,
        resolvedAt: new Date(),
      },
    });

    return NextResponse.json({ ok: true, status: "RELEASED", txRelease: txHash });
  } catch (err) {
    console.error("[POST /api/vendor/orders/[id]/release] Failed:", err);
    return NextResponse.json(
      { error: "Could not release funds right now. Please try again." },
      { status: 502 }
    );
  }
}
