import { prisma } from "@/lib/prisma";
import { escrowService } from "@/server/stellar/escrow";

/**
 * Atomically transitions an order from PENDING_PAYMENT to SECURED by minting
 * test NGN and creating the on-chain Claimable Balance in one Stellar tx.
 * Safe against concurrent Paystack webhook + callback verification calls.
 */
export async function confirmOrderPayment(orderId: string): Promise<{
  status: string;
  alreadyProcessed: boolean;
}> {
  const claim = await prisma.order.updateMany({
    where: { id: orderId, status: "PENDING_PAYMENT" },
    data: { status: "PROCESSING_PAYMENT" },
  });

  if (claim.count === 0) {
    const current = await prisma.order.findUnique({
      where: { id: orderId },
      select: { status: true },
    });
    return {
      status: current?.status ?? "UNKNOWN",
      alreadyProcessed: true,
    };
  }

  try {
    const order = await prisma.order.findUniqueOrThrow({
      where: { id: orderId },
      include: {
        product: { select: { windowMinutes: true } },
      },
    });

    const deadline = new Date(
      Date.now() + order.product.windowMinutes * 60_000
    );
    const deadlineUnix = Math.floor(deadline.getTime() / 1000);

    const { claimableBalanceId, txHash } = await escrowService.mintAndCreate({
      buyerPublicKey: order.buyerStellarPublic,
      buyerPrivyWalletId: order.buyerPrivyWalletId,
      amountNgn: order.amountNgn.toString(),
      deadlineUnix,
    });

    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "SECURED",
        claimableBalanceId,
        txCreate: txHash,
        deadline,
      },
    });

    return { status: "SECURED", alreadyProcessed: false };
  } catch (err) {
    // Allow clean retry on webhook redelivery or manual refresh
    await prisma.order.updateMany({
      where: { id: orderId, status: "PROCESSING_PAYMENT" },
      data: { status: "PENDING_PAYMENT" },
    });
    throw err;
  }
}
