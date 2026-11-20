import { notFound } from "next/navigation";
import { BuyerOrderView } from "@/components/order/BuyerOrderView";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/server/crypto";
import {
  hasBuyerOrderAccess,
  maskEmail,
} from "@/server/orders/buyer-access";

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

  const hasAccess = await hasBuyerOrderAccess({
    id: order.id,
    token: order.token,
  });

  const releaseCode =
    hasAccess && (order.status === "SECURED" || order.status === "SHIPPED")
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
        hasAccess,
        maskedBuyerEmail: maskEmail(order.buyerEmail),
        buyerName: hasAccess ? order.buyerName : null,
        buyerAddress: hasAccess ? order.buyerAddress : null,
        paystackAuthorizationUrl: hasAccess
          ? order.paystackAuthorizationUrl
          : null,
        deadlineIso: order.deadline ? order.deadline.toISOString() : null,
        shippedAtIso: order.shippedAt ? order.shippedAt.toISOString() : null,
        disputeReason: hasAccess ? order.disputeReason : null,
        resolvedAtIso: order.resolvedAt ? order.resolvedAt.toISOString() : null,
        releaseCode,
        claimableBalanceId: hasAccess ? order.claimableBalanceId : null,
        txCreate: hasAccess ? order.txCreate : null,
        txRelease: hasAccess ? order.txRelease : null,
        txRefund: hasAccess ? order.txRefund : null,
        productName: order.product.name,
        productImageUrl: order.product.imageUrl,
        windowMinutes: order.product.windowMinutes,
        vendorName: order.product.vendor.businessName,
      }}
    />
  );
}
