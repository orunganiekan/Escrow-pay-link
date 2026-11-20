import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const DisputeSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(5, "Please describe the issue (at least 5 characters).")
    .max(500, "Description is too long."),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ token: string }> }
) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const parsed = DisputeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid dispute reason." },
      { status: 400 }
    );
  }

  const { token } = await context.params;
  const order = await prisma.order.findUnique({
    where: { token },
    select: { id: true, status: true, deadline: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  if (order.status !== "SECURED" && order.status !== "SHIPPED") {
    return NextResponse.json(
      { error: "Only active orders can be disputed." },
      { status: 400 }
    );
  }

  if (!order.deadline || order.deadline.getTime() <= Date.now()) {
    return NextResponse.json(
      {
        error:
          "Delivery window has already expired — you can claim a full refund directly.",
      },
      { status: 400 }
    );
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "DISPUTED",
      disputeReason: parsed.data.reason,
      disputedAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true, status: "DISPUTED" });
}
