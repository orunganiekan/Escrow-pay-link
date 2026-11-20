import Link from "next/link";
import { redirect } from "next/navigation";
import { PaginationControls } from "@/components/PaginationControls";
import { ProductsList } from "@/components/dashboard/ProductsList";
import { getAppUrl } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedVendor } from "@/lib/vendor";

export const instant = false;
const PAGE_SIZE = 12;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const vendor = await getAuthenticatedVendor();
  if (!vendor) {
    redirect("/login");
  }

  const query = await searchParams;
  const requestedPage = Math.max(1, Number(query.page || "1") || 1);

  const totalCount = await prisma.product.count({
    where: { vendorId: vendor.id },
  });
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);

  const products = await prisma.product.findMany({
    where: { vendorId: vendor.id },
    orderBy: { createdAt: "desc" },
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    include: {
      _count: { select: { orders: true } },
    },
  });

  const initialProducts = products.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    imageUrl: p.imageUrl,
    priceNgn: p.priceNgn.toString(),
    windowMinutes: p.windowMinutes,
    active: p.active,
    orderCount: p._count.orders,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display font-medium text-[26px] tracking-[-0.02em] text-[#1A1A1A]">
          Pay Links
        </h1>
        <Link
          href="/dashboard/products/new"
          className="hidden lg:inline-flex h-10 px-5 rounded-full bg-[#1A1A1A] text-[#FFFFFF] text-[14px] font-medium items-center hover:bg-[#2E2E2E] active:scale-[0.98] transition-all"
        >
          + Create Link
        </Link>
      </div>

      <ProductsList initialProducts={initialProducts} appUrl={getAppUrl()} />

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="/dashboard/products"
      />
    </div>
  );
}
