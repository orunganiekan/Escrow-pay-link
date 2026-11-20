import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminDisputesView } from "@/components/admin/AdminDisputesView";
import { getAdminSession } from "@/lib/admin";
import { auth } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";

export const instant = false;

export default async function AdminPage() {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    redirect("/login");
  }

  const admin = await getAdminSession();
  if (!admin) {
    return (
      <main className="min-h-screen bg-[#F8F6F1] flex items-center justify-center px-4">
        <div className="max-w-[420px] w-full bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl p-8 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#B42318]">
            ACCESS RESTRICTED
          </p>
          <h1 className="mt-2 text-[20px] font-semibold text-[#1A1A1A]">
            Admin access required
          </h1>
          <p className="mt-2 text-[14px] text-[#5F6368]">
            Sign in with the configured administrator account to review
            disputes.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 h-10 px-5 rounded-full border border-[#E5E5E5] text-[13px] font-medium text-[#1A1A1A] inline-flex items-center hover:bg-[#F4F3EF]"
          >
            Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  const disputedOrders = await prisma.order.findMany({
    where: { status: "DISPUTED" },
    orderBy: { disputedAt: "desc" },
    include: {
      product: {
        select: {
          name: true,
          vendor: { select: { businessName: true } },
        },
      },
    },
  });

  const serialized = disputedOrders.map((o) => ({
    id: o.id,
    status: o.status,
    amountNgn: o.amountNgn.toString(),
    productName: o.product.name,
    vendorName: o.product.vendor.businessName,
    buyerName: o.buyerName,
    buyerPhone: o.buyerPhone,
    disputeReason: o.disputeReason,
    deadlineIso: o.deadline ? o.deadline.toISOString() : null,
    txCreate: o.txCreate,
    txRelease: o.txRelease,
    txRefund: o.txRefund,
  }));

  return (
    <main className="min-h-screen bg-[#FFFFFF]">
      <header className="w-full border-b border-[#E5E5E5]">
        <div className="max-w-[960px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="text-[16px] font-semibold tracking-tight text-[#1A1A1A]"
          >
            EscrowPay
          </Link>
          <Link
            href="/dashboard"
            className="text-[13px] font-medium text-[#5F6368] hover:text-[#1A1A1A]"
          >
            Dashboard →
          </Link>
        </div>
      </header>

      <div className="max-w-[960px] mx-auto px-6 py-8 space-y-6">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5F6368]">
            ADMIN ARBITRATION
          </p>
          <h1 className="mt-1 text-[24px] font-semibold tracking-[-0.02em] text-[#1A1A1A]">
            Open disputes ({serialized.length})
          </h1>
        </div>

        <AdminDisputesView disputes={serialized} />
      </div>
    </main>
  );
}
