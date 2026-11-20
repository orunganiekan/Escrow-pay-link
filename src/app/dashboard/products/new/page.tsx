import Link from "next/link";
import { CreateProductForm } from "@/components/dashboard/CreateProductForm";
import { getAppUrl } from "@/lib/format";

export const instant = false;

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/products"
          className="text-[13px] font-medium text-[#5F6368] hover:text-[#1A1A1A]"
        >
          ← Back to Pay Links
        </Link>
        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.08em] text-[#5F6368]">
          NEW PAY LINK
        </p>
        <h1 className="mt-1 text-[24px] font-semibold tracking-[-0.02em] text-[#1A1A1A]">
          Create a protected product link
        </h1>
      </div>

      <CreateProductForm appUrl={getAppUrl()} />
    </div>
  );
}
