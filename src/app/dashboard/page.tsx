import Link from "next/link";
import { redirect } from "next/navigation";
import { OverviewBanner } from "@/components/dashboard/OverviewBanner";
import { auth } from "@/lib/auth/server";
import { formatNaira } from "@/lib/format";
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

  const [availableBalanceNgn, orders, productCount] = await Promise.all([
    getNgnBalance(vendor.stellarPublic),
    prisma.order.findMany({
      where: { product: { vendorId: vendor.id } },
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
      take: 20,
    }),
    prisma.product.count({ where: { vendorId: vendor.id } }),
  ]);

  let inEscrowNgn = 0;
  let completedCount = 0;
  let disputedCount = 0;

  for (const o of orders) {
    if (
      o.status === "SECURED" ||
      o.status === "SHIPPED" ||
      o.status === "DISPUTED"
    ) {
      inEscrowNgn += Number(o.amountNgn);
    }
    if (o.status === "RELEASED") completedCount += 1;
    if (o.status === "DISPUTED") disputedCount += 1;
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5F6368]">
          STORE OVERVIEW
        </p>
        <h1 className="mt-1 text-[24px] font-semibold tracking-[-0.02em] text-[#1A1A1A]">
          {vendor.businessName}
        </h1>
      </div>

      <OverviewBanner
        availableBalanceNgn={availableBalanceNgn}
        inEscrowNgn={inEscrowNgn}
        completedCount={completedCount}
        disputedCount={disputedCount}
      />

      <section className="border border-[#E5E5E5] rounded-2xl p-6 bg-[#FFFFFF]">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E5E5E5]">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5F6368]">
              RECENT ACTIVITY
            </p>
            <h2 className="mt-1 text-[16px] font-medium text-[#1A1A1A]">
              {productCount === 0
                ? "Create your first protected pay link"
                : `${productCount} active pay link${productCount === 1 ? "" : "s"}`}
            </h2>
          </div>
          <Link
            href="/dashboard/products/new"
            className="h-10 px-5 rounded-full bg-[#1A1A1A] text-[#FFFFFF] text-[14px] font-medium inline-flex items-center hover:bg-[#1A1A1A]/90"
          >
            + Create Link
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-[14px] text-[#5F6368]">
              No orders yet. Share a pay link on WhatsApp or Instagram to accept
              protected Naira payments.
            </p>
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
                <span className="font-mono tabular-nums text-[14px] font-medium text-[#1A1A1A] shrink-0">
                  {formatNaira(order.amountNgn.toString())}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
