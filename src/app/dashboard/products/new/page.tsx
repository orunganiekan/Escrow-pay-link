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
        <h1 className="mt-3 font-display font-medium text-[26px] tracking-[-0.02em] text-[#1A1A1A]">
          Create a pay link
        </h1>
      </div>

      <CreateProductForm appUrl={getAppUrl()} />
    </div>
  );
}
