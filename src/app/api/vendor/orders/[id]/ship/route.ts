import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedVendor } from "@/lib/vendor";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const vendor = await getAuthenticatedVendor();
  if (!vendor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { product: { select: { vendorId: true } } },
  });

  if (!order || order.product.vendorId !== vendor.id) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  if (order.status !== "SECURED") {
    return NextResponse.json(
      { error: "Only secured orders can be marked as shipped." },
      { status: 400 }
    );
  }

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "SHIPPED",
      shippedAt: new Date(),
    },
    select: { status: true, shippedAt: true },
  });

  return NextResponse.json({ ok: true, ...updated });
}
