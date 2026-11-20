import { redirect } from "next/navigation";
import { VendorOrdersView } from "@/components/dashboard/VendorOrdersView";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedVendor } from "@/lib/vendor";

export const instant = false;

export default async function VendorOrdersPage() {
  const vendor = await getAuthenticatedVendor();
  if (!vendor) {
    redirect("/login");
  }

  const orders = await prisma.order.findMany({
    where: {
      product: { vendorId: vendor.id },
      status: { not: "PENDING_PAYMENT" },
    },
    orderBy: { createdAt: "desc" },
    include: {
      product: {
        select: { name: true, imageUrl: true },
      },
    },
  });

  const serialized = orders.map((o) => ({
    id: o.id,
    status: o.status,
    amountNgn: o.amountNgn.toString(),
    buyerName: o.buyerName,
    buyerPhone: o.buyerPhone,
    buyerAddress: o.buyerAddress,
    releaseAttempts: o.releaseAttempts,
    deadlineIso: o.deadline ? o.deadline.toISOString() : null,
    createdAtIso: o.createdAt.toISOString(),
    productName: o.product.name,
    productImageUrl: o.product.imageUrl,
  }));

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5F6368]">
          ORDERS
        </p>
        <h1 className="mt-1 text-[24px] font-semibold tracking-[-0.02em] text-[#1A1A1A]">
          Customer orders
        </h1>
      </div>

      <VendorOrdersView orders={serialized} />
    </div>
  );
}
