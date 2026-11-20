import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedVendor } from "@/lib/vendor";

const MIN_WINDOW_MINUTES = 2;
const MAX_WINDOW_MINUTES = 43200; // 30 days

const CreateProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Product name must be at least 2 characters.")
    .max(120, "Product name is too long."),
  description: z.string().trim().max(500).optional(),
  imageUrl: z
    .string()
    .trim()
    .refine(
      (val) => {
        if (!val) return true;
        try {
          const parsed = new URL(val);
          return parsed.protocol === "http:" || parsed.protocol === "https:";
        } catch {
          return false;
        }
      },
      { message: "Image URL must start with http:// or https://" }
    )
    .optional(),
  priceNgn: z
    .number({ error: "Enter a valid price in Naira." })
    .finite()
    .positive("Price must be greater than ₦0.")
    .max(50_000_000, "Price exceeds maximum single-link limit."),
  windowMinutes: z
    .number()
    .int()
    .min(MIN_WINDOW_MINUTES, "Delivery window must be at least 2 minutes.")
    .max(MAX_WINDOW_MINUTES, "Delivery window cannot exceed 30 days."),
});

const SLUG_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";

function generateSlug(length = 7): string {
  const bytes = crypto.randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += SLUG_ALPHABET[bytes[i] % SLUG_ALPHABET.length];
  }
  return out;
}

export async function GET(request: Request) {
  const vendor = await getAuthenticatedVendor();
  if (!vendor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") || "1") || 1);
  const pageSize = 50;

  const products = await prisma.product.findMany({
    where: { vendorId: vendor.id },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
    include: {
      _count: { select: { orders: true } },
    },
  });

  return NextResponse.json({
    products: products.map((p) => ({
      ...p,
      priceNgn: p.priceNgn.toString(),
    })),
  });
}

export async function POST(request: Request) {
  const vendor = await getAuthenticatedVendor();
  if (!vendor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const parsed = CreateProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid input." },
      { status: 400 }
    );
  }

  // Retry slug generation on rare collision
  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = generateSlug(7);
    const existing = await prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (existing) continue;

    const product = await prisma.product.create({
      data: {
        slug,
        vendorId: vendor.id,
        name: parsed.data.name,
        description: parsed.data.description || null,
        imageUrl: parsed.data.imageUrl || null,
        priceNgn: parsed.data.priceNgn.toFixed(2),
        windowMinutes: parsed.data.windowMinutes,
      },
    });

    return NextResponse.json(
      {
        product: {
          ...product,
          priceNgn: product.priceNgn.toString(),
        },
      },
      { status: 201 }
    );
  }

  return NextResponse.json(
    { error: "Could not generate a unique link slug. Please try again." },
    { status: 500 }
  );
}
