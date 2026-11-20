import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { escrowService } from "@/server/stellar/escrow";

export const maxDuration = 30;

const ResolveSchema = z.object({
  action: z.enum(["release", "refund"]),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const parsed = ResolveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  }

  const { id } = await context.params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      product: {
        select: {
          vendor: { select: { stellarPublic: true } },
        },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  if (order.status !== "DISPUTED") {
    return NextResponse.json(
      { error: "Only disputed orders can be resolved here." },
      { status: 400 }
    );
  }

  if (!order.deadline || order.deadline.getTime() <= Date.now()) {
    return NextResponse.json(
      {
        error:
          "Escrow window expired on-chain; buyer can claim refund directly.",
      },
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
    if (parsed.data.action === "release") {
      const { txHash } = await escrowService.release({
        claimableBalanceId: order.claimableBalanceId,
        vendorPublicKey: order.product.vendor.stellarPublic,
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

      return NextResponse.json({
        ok: true,
        status: "RELEASED",
        txRelease: txHash,
      });
    }

    const { txHash } = await escrowService.adminRefund({
      claimableBalanceId: order.claimableBalanceId,
      buyerPublicKey: order.buyerStellarPublic,
      amountNgn: order.amountNgn.toString(),
    });

    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "REFUNDED",
        txRefund: txHash,
        resolvedAt: new Date(),
      },
    });

    return NextResponse.json({
      ok: true,
      status: "REFUNDED",
      txRefund: txHash,
    });
  } catch (err) {
    console.error("[POST /api/admin/orders/[id]/resolve] Failed:", err);
    return NextResponse.json(
      { error: "Could not resolve dispute on-chain. Please try again." },
      { status: 502 }
    );
  }
}
