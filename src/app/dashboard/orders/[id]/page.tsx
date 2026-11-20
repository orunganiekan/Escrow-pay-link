import { notFound, redirect } from "next/navigation";
import { VendorOrderDetailView } from "@/components/dashboard/VendorOrderDetailView";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedVendor } from "@/lib/vendor";

export const instant = false;

export default async function VendorOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const vendor = await getAuthenticatedVendor();
  if (!vendor) {
    redirect("/login");
  }

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      product: {
        select: { vendorId: true, name: true, imageUrl: true },
      },
    },
  });

  if (!order || order.product.vendorId !== vendor.id) {
    notFound();
  }

  return (
    <VendorOrderDetailView
      order={{
        id: order.id,
        status: order.status,
        amountNgn: order.amountNgn.toString(),
        buyerName: order.buyerName,
        buyerPhone: order.buyerPhone,
        buyerEmail: order.buyerEmail,
        buyerAddress: order.buyerAddress,
        releaseAttempts: order.releaseAttempts,
        deadlineIso: order.deadline ? order.deadline.toISOString() : null,
        disputeReason: order.disputeReason,
        txCreate: order.txCreate,
        txRelease: order.txRelease,
        txRefund: order.txRefund,
        productName: order.product.name,
        productImageUrl: order.product.imageUrl,
      }}
    />
  );
}
