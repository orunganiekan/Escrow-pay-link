import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { createPrivyStellarAccount } from "@/server/stellar/accounts";

const OnboardingSchema = z.object({
  businessName: z.string().trim().min(2, "Business name must be at least 2 characters.").max(80),
  whatsapp: z.string().trim().max(30).optional(),
  instagram: z.string().trim().max(50).optional(),
});

export async function POST(request: Request) {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const parsed = OnboardingSchema.safeParse(body);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]?.message || "Invalid input.";
    return NextResponse.json({ error: firstIssue }, { status: 400 });
  }

  const existing = await prisma.vendor.findUnique({
    where: { authUserId: session.user.id },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json({ ok: true, vendorId: existing.id });
  }

  const { publicKey, privyWalletId } = await createPrivyStellarAccount();

  const vendor = await prisma.vendor.create({
    data: {
      authUserId: session.user.id,
      email: session.user.email,
      businessName: parsed.data.businessName,
      whatsapp: parsed.data.whatsapp || null,
      instagram: parsed.data.instagram || null,
      stellarPublic: publicKey,
      privyWalletId,
    },
    select: { id: true, businessName: true },
  });

  return NextResponse.json({ ok: true, vendor }, { status: 201 });
}
