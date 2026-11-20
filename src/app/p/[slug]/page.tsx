import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCheckoutView } from "@/components/checkout/ProductCheckoutView";
import { formatDeliveryWindow, formatNaira, getAppUrl } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const instant = false;

async function getPublicProduct(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      vendor: {
        select: {
          id: true,
          businessName: true,
        },
      },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPublicProduct(slug);

  if (!product || !product.active) {
    return {
      title: "Pay Link Unavailable — EscrowPay",
      description: "This payment link is unavailable or paused.",
    };
  }

  const price = formatNaira(product.priceNgn.toString());
  const windowLabel = formatDeliveryWindow(product.windowMinutes);
  const title = `${product.name} — ${price} | ${product.vendor.businessName}`;
  const description =
    product.description?.trim() ||
    `Pay ${price} safely with ${windowLabel} delivery protection on EscrowPay. Your money is held until you confirm delivery.`;
  const url = `${getAppUrl()}/p/${product.slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "website",
      siteName: "EscrowPay",
      images: product.imageUrl ? [{ url: product.imageUrl }] : undefined,
    },
    twitter: {
      card: product.imageUrl ? "summary_large_image" : "summary",
      title,
      description,
      images: product.imageUrl ? [product.imageUrl] : undefined,
    },
  };
}

export default async function PublicProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getPublicProduct(slug);

  if (!product) {
    notFound();
  }

  if (!product.active) {
    return (
      <main className="min-h-screen bg-[#F8F6F1] flex items-center justify-center px-4">
        <div className="max-w-[400px] w-full bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl p-8 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5F6368]">
            LINK PAUSED
          </p>
          <h1 className="mt-2 text-[20px] font-semibold text-[#1A1A1A]">
            This pay link is currently paused
          </h1>
          <p className="mt-2 text-[14px] text-[#5F6368]">
            Contact {product.vendor.businessName} for an updated link.
          </p>
          <Link
            href="/"
            className="mt-6 h-10 px-5 rounded-full border border-[#E5E5E5] text-[13px] font-medium text-[#1A1A1A] inline-flex items-center hover:bg-[#F4F3EF]"
          >
            Go home
          </Link>
        </div>
      </main>
    );
  }

  const [completedOrders, disputedOrders] = await Promise.all([
    prisma.order.count({
      where: { product: { vendorId: product.vendor.id }, status: "RELEASED" },
    }),
    prisma.order.count({
      where: { product: { vendorId: product.vendor.id }, status: "DISPUTED" },
    }),
  ]);

  return (
    <ProductCheckoutView
      product={{
        id: product.id,
        slug: product.slug,
        name: product.name,
        description: product.description,
        imageUrl: product.imageUrl,
        priceNgn: product.priceNgn.toString(),
        windowMinutes: product.windowMinutes,
        vendorName: product.vendor.businessName,
        completedOrders,
        disputedOrders,
      }}
    />
  );
}
