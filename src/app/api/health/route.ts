import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [vendors, products, orders] = await Promise.all([
      prisma.vendor.count(),
      prisma.product.count(),
      prisma.order.count(),
    ]);
    return NextResponse.json({
      ok: true,
      db: "connected",
      counts: { vendors, products, orders },
    });
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json(
      { ok: false, db: "error" },
      { status: 500 }
    );
  }
}
