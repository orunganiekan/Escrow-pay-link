import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { confirmOrderPayment } from "@/server/orders/confirm";
import { toKobo, verifyPaystackTransaction } from "@/server/paystack";

export const maxDuration = 30;

export async function POST(
  _request: Request,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;

  const order = await prisma.order.findUnique({
    where: { token },
    select: {
      id: true,
      status: true,
      amountNgn: true,
      paystackReference: true,
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  if (order.status !== "PENDING_PAYMENT") {
    return NextResponse.json({
      verified: order.status !== "PROCESSING_PAYMENT",
      status: order.status,
    });
  }

  if (!order.paystackReference) {
    return NextResponse.json(
      { error: "Missing Paystack reference." },
      { status: 400 }
    );
  }

  const tx = await verifyPaystackTransaction(order.paystackReference);
  if (tx.status !== "success") {
    return NextResponse.json({
      verified: false,
      status: order.status,
      paystackStatus: tx.status,
    });
  }

  const expectedKobo = toKobo(order.amountNgn.toString());
  if (tx.currency !== "NGN" || tx.amount !== expectedKobo) {
    return NextResponse.json(
      { error: "Payment amount or currency mismatch." },
      { status: 400 }
    );
  }

  const result = await confirmOrderPayment(order.id);
  return NextResponse.json({
    verified: true,
    status: result.status,
  });
}
