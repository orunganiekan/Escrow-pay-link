import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { confirmOrderPayment } from "@/server/orders/confirm";
import { toKobo, verifyPaystackWebhookSignature } from "@/server/paystack";

export const maxDuration = 30;

interface PaystackWebhookPayload {
  event?: string;
  data?: {
    reference?: string;
    amount?: number;
    currency?: string;
    status?: string;
  };
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!verifyPaystackWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let payload: PaystackWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as PaystackWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (payload.event !== "charge.success" || !payload.data?.reference) {
    return NextResponse.json({ received: true });
  }

  const order = await prisma.order.findUnique({
    where: { paystackReference: payload.data.reference },
    select: { id: true, amountNgn: true },
  });

  if (!order) {
    return NextResponse.json({ received: true });
  }

  const expectedKobo = toKobo(order.amountNgn.toString());
  if (
    payload.data.currency !== "NGN" ||
    Number(payload.data.amount) !== expectedKobo
  ) {
    return NextResponse.json(
      { error: "Amount or currency mismatch." },
      { status: 400 }
    );
  }

  const result = await confirmOrderPayment(order.id);
  return NextResponse.json({ ok: true, status: result.status });
}
