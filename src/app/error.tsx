"use client";

import Link from "next/link";

export default function GlobalErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-[#F8F6F1] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-[420px] mb-5">
        <Link
          href="/"
          className="font-display text-[16px] font-medium tracking-[-0.02em] text-[#1A1A1A]"
        >
          EscrowPay
        </Link>
      </div>

      <section className="w-full max-w-[420px] bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl p-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#B42318]">
          SOMETHING WENT WRONG
        </p>
        <h1 className="mt-2 font-display font-medium text-[22px] tracking-[-0.02em] text-[#1A1A1A]">
          We couldn&apos;t load this page
        </h1>
        <p className="mt-2 text-[14px] text-[#5F6368] leading-relaxed">
          A temporary connection error occurred. Your funds and order status are
          unaffected — try refreshing below.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="h-11 px-6 rounded-full bg-[#1A1A1A] text-[#FFFFFF] text-[14px] font-medium inline-flex items-center hover:bg-[#2E2E2E] active:scale-[0.98] transition-all cursor-pointer"
          >
            Try again
          </button>
          <Link
            href="/"
            className="h-11 px-5 rounded-full border border-[#E5E5E5] text-[#1A1A1A] text-[14px] font-medium inline-flex items-center hover:bg-[#F4F3EF] transition-colors"
          >
            Go home
          </Link>
        </div>
      </section>
    </main>
  );
}
