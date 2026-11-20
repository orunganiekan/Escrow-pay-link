import Link from "next/link";
import { redirect } from "next/navigation";
import { NairaAmount } from "@/components/NairaAmount";
import { OverviewBanner } from "@/components/dashboard/OverviewBanner";
import { auth } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { getNgnBalance } from "@/server/stellar/accounts";

export const instant = false;

export default async function DashboardOverviewPage() {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    redirect("/login");
  }

  const vendor = await prisma.vendor.findUnique({
    where: { authUserId: session.user.id },
    select: {
      id: true,
      businessName: true,
      stellarPublic: true,
    },
  });

  if (!vendor) {
    redirect("/onboarding");
  }

  const [
    availableBalanceNgn,
    recentOrders,
    inEscrowAgg,
    completedCount,
    disputedCount,
    productCount,
  ] = await Promise.all([
    getNgnBalance(vendor.stellarPublic),
    prisma.order.findMany({
      where: {
        product: { vendorId: vendor.id },
        status: { not: "PENDING_PAYMENT" },
      },
      select: {
        id: true,
        token: true,
        status: true,
        amountNgn: true,
        buyerName: true,
        createdAt: true,
        product: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.order.aggregate({
      where: {
        product: { vendorId: vendor.id },
        status: { in: ["SECURED", "SHIPPED", "DISPUTED"] },
      },
      _sum: { amountNgn: true },
    }),
    prisma.order.count({
      where: { product: { vendorId: vendor.id }, status: "RELEASED" },
    }),
    prisma.order.count({
      where: { product: { vendorId: vendor.id }, status: "DISPUTED" },
    }),
    prisma.product.count({ where: { vendorId: vendor.id } }),
  ]);

  const inEscrowNgn = Number(inEscrowAgg._sum.amountNgn ?? 0);
  const orders = recentOrders;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-medium text-[26px] tracking-[-0.02em] text-[#1A1A1A]">
          Overview
        </h1>
      </div>

      <OverviewBanner
        availableBalanceNgn={availableBalanceNgn}
        inEscrowNgn={inEscrowNgn}
        completedCount={completedCount}
        disputedCount={disputedCount}
      />

      <section className="border border-[#E5E5E5] rounded-xl p-6 bg-[#FFFFFF]">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E5E5E5]">
          <h2 className="font-display font-medium text-[17px] text-[#1A1A1A]">
            {orders.length === 0
              ? "Recent orders"
              : `${orders.length} recent order${orders.length === 1 ? "" : "s"}`}
          </h2>
          {productCount > 0 ? (
            <Link
              href="/dashboard/products"
              className="text-[13px] font-medium text-[#5F6368] hover:text-[#1A1A1A]"
            >
              {productCount} pay link{productCount === 1 ? "" : "s"} →
            </Link>
          ) : null}
        </div>

        {orders.length === 0 ? (
          <div className="py-10 flex flex-col items-center text-center">
            <p className="text-[14px] text-[#5F6368] max-w-[360px]">
              Your store is ready. Create your first pay link and share it in a
              WhatsApp or Instagram DM.
            </p>
            <Link
              href="/dashboard/products/new"
              className="mt-5 h-10 px-5 rounded-full bg-[#1A1A1A] text-[#FFFFFF] text-[14px] font-medium inline-flex items-center hover:bg-[#2E2E2E] active:scale-[0.98] transition-all"
            >
              + Create your first pay link
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-[#E5E5E5]">
            {orders.slice(0, 6).map((order) => (
              <li
                key={order.id}
                className="py-3.5 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="text-[14px] font-medium text-[#1A1A1A] truncate">
                    {order.product.name}
                  </p>
                  <p className="text-[13px] text-[#5F6368] truncate">
                    {order.buyerName} · {order.status.replaceAll("_", " ")}
                  </p>
                </div>
                <span className="text-[14px] font-medium text-[#1A1A1A] shrink-0">
                  <NairaAmount value={order.amountNgn.toString()} />
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
