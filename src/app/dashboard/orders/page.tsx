import { redirect } from "next/navigation";
import { PaginationControls } from "@/components/PaginationControls";
import { VendorOrdersView } from "@/components/dashboard/VendorOrdersView";
import type { OrderStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedVendor } from "@/lib/vendor";

export const instant = false;
const PAGE_SIZE = 18;
const ALLOWED_STATUSES: OrderStatus[] = [
  "SECURED",
  "SHIPPED",
  "RELEASED",
  "DISPUTED",
  "REFUNDED",
];

export default async function VendorOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; q?: string }>;
}) {
  const vendor = await getAuthenticatedVendor();
  if (!vendor) {
    redirect("/login");
  }

  const query = await searchParams;
  const activeStatus = ALLOWED_STATUSES.includes(query.status as OrderStatus)
    ? (query.status as OrderStatus)
    : "ALL";
  const search = query.q?.trim() || "";
  const requestedPage = Math.max(1, Number(query.page || "1") || 1);

  const baseWhere = {
    product: { vendorId: vendor.id },
    status: { not: "PENDING_PAYMENT" as OrderStatus },
  };

  const filteredWhere = {
    product: { vendorId: vendor.id },
    status:
      activeStatus === "ALL"
        ? { not: "PENDING_PAYMENT" as OrderStatus }
        : activeStatus,
    ...(search
      ? {
          OR: [
            { buyerName: { contains: search, mode: "insensitive" as const } },
            { buyerPhone: { contains: search, mode: "insensitive" as const } },
            {
              product: {
                name: { contains: search, mode: "insensitive" as const },
              },
            },
          ],
        }
      : {}),
  };

  const [groupedCounts, totalFiltered] = await Promise.all([
    prisma.order.groupBy({
      by: ["status"],
      where: baseWhere,
      _count: { _all: true },
    }),
    prisma.order.count({ where: filteredWhere }),
  ]);

  const statusCounts: Record<string, number> = {
    ALL: 0,
    SECURED: 0,
    SHIPPED: 0,
    RELEASED: 0,
    DISPUTED: 0,
    REFUNDED: 0,
  };
  for (const row of groupedCounts) {
    statusCounts.ALL += row._count._all;
    statusCounts[row.status] = row._count._all;
  }

  const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);

  const orders = await prisma.order.findMany({
    where: filteredWhere,
    orderBy: { createdAt: "desc" },
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
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
        <h1 className="font-display font-medium text-[26px] tracking-[-0.02em] text-[#1A1A1A]">
          Orders
        </h1>
      </div>

      <VendorOrdersView
        orders={serialized}
        statusCounts={statusCounts}
        activeFilter={activeStatus}
        initialSearch={search}
      />

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="/dashboard/orders"
        queryParams={{
          status: activeStatus !== "ALL" ? activeStatus : undefined,
          q: search || undefined,
        }}
      />
    </div>
  );
}
