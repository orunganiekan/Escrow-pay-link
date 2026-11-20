import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { escrowService } from "@/server/stellar/escrow";

export async function POST(
  _request: Request,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;

  const order = await prisma.order.findUnique({
    where: { token },
    select: {
      id: true,
      status: true,
      deadline: true,
      claimableBalanceId: true,
      buyerStellarPublic: true,
      buyerPrivyWalletId: true,
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  if (
    order.status !== "SECURED" &&
    order.status !== "SHIPPED" &&
    order.status !== "DISPUTED"
  ) {
    return NextResponse.json(
      { error: "This order is not eligible for a refund." },
      { status: 400 }
    );
  }

  if (!order.deadline || order.deadline.getTime() > Date.now()) {
    return NextResponse.json(
      { error: "Refund is only available after the delivery window expires." },
      { status: 400 }
    );
  }

  if (!order.claimableBalanceId) {
    return NextResponse.json(
      { error: "Missing escrow claimable balance." },
      { status: 400 }
    );
  }

  try {
    const { txHash } = await escrowService.refund({
      claimableBalanceId: order.claimableBalanceId,
      buyerPublicKey: order.buyerStellarPublic,
      buyerPrivyWalletId: order.buyerPrivyWalletId,
    });

    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "REFUNDED",
        txRefund: txHash,
        resolvedAt: new Date(),
      },
    });

    return NextResponse.json({ ok: true, status: "REFUNDED", txRefund: txHash });
  } catch (err) {
    console.error("[POST /api/orders/[token]/refund] Failed:", err);
    return NextResponse.json(
      { error: "Could not complete refund yet. Please try again in a few seconds." },
      { status: 502 }
    );
  }
}
