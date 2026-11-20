import Link from "next/link";
import { redirect } from "next/navigation";
import { ProductsList } from "@/components/dashboard/ProductsList";
import { getAppUrl } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedVendor } from "@/lib/vendor";

export const instant = false;

export default async function ProductsPage() {
  const vendor = await getAuthenticatedVendor();
  if (!vendor) {
    redirect("/login");
  }

  const products = await prisma.product.findMany({
    where: { vendorId: vendor.id },
    orderBy: { createdAt: "desc" },
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
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5F6368]">
            PAY LINKS
          </p>
          <h1 className="mt-1 text-[24px] font-semibold tracking-[-0.02em] text-[#1A1A1A]">
            Your product links
          </h1>
        </div>
        <Link
          href="/dashboard/products/new"
          className="hidden lg:inline-flex h-10 px-5 rounded-full bg-[#1A1A1A] text-[#FFFFFF] text-[14px] font-medium items-center hover:bg-[#1A1A1A]/90"
        >
          + Create Link
        </Link>
      </div>

      <ProductsList initialProducts={initialProducts} appUrl={getAppUrl()} />
    </div>
  );
}
