import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { auth } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { getNgnBalance } from "@/server/stellar/accounts";

export const instant = false;

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    redirect("/login");
  }

  const vendor = await prisma.vendor.findUnique({
    where: { authUserId: session.user.id },
    select: {
      id: true,
      businessName: true,
      email: true,
      stellarPublic: true,
    },
  });

  if (!vendor) {
    redirect("/onboarding");
  }

  const [securedOrdersCount, availableBalanceNgn] = await Promise.all([
    prisma.order.count({
      where: {
        status: "SECURED",
        product: { vendorId: vendor.id },
      },
    }),
    getNgnBalance(vendor.stellarPublic),
  ]);

  return (
    <DashboardShell
      storeName={vendor.businessName}
      email={vendor.email}
      securedOrdersCount={securedOrdersCount}
      availableBalanceNgn={availableBalanceNgn}
    >
      {children}
    </DashboardShell>
  );
}
