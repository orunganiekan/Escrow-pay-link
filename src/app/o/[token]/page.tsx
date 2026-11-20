import { notFound } from "next/navigation";
import { BuyerOrderView } from "@/components/order/BuyerOrderView";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/server/crypto";

export const instant = false;

export default async function BuyerOrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ verify?: string }>;
}) {
  const [{ token }, query] = await Promise.all([params, searchParams]);

  const order = await prisma.order.findUnique({
    where: { token },
    include: {
      product: {
        select: {
          name: true,
          imageUrl: true,
          windowMinutes: true,
          vendor: {
            select: { businessName: true },
          },
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  const releaseCode =
    order.status === "SECURED" || order.status === "SHIPPED"
      ? decrypt(order.codeEnc)
      : null;

  return (
    <BuyerOrderView
      shouldVerifyOnMount={query.verify === "1"}
      order={{
        id: order.id,
        token: order.token,
        status: order.status,
        amountNgn: order.amountNgn.toString(),
        buyerName: order.buyerName,
        buyerAddress: order.buyerAddress,
        paystackAuthorizationUrl: order.paystackAuthorizationUrl,
        deadlineIso: order.deadline ? order.deadline.toISOString() : null,
        shippedAtIso: order.shippedAt ? order.shippedAt.toISOString() : null,
        disputeReason: order.disputeReason,
        resolvedAtIso: order.resolvedAt ? order.resolvedAt.toISOString() : null,
        releaseCode,
        claimableBalanceId: order.claimableBalanceId,
        txCreate: order.txCreate,
        txRelease: order.txRelease,
        txRefund: order.txRefund,
        productName: order.product.name,
        productImageUrl: order.product.imageUrl,
        windowMinutes: order.product.windowMinutes,
        vendorName: order.product.vendor.businessName,
      }}
    />
  );
}
