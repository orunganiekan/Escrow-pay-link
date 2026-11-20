import Link from "next/link";
import { EscrowFlowDemo } from "@/components/landing/EscrowFlowDemo";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FFFFFF] flex flex-col overflow-x-clip">
      {/* Persistent Fixed Navbar */}
      <header className="fixed top-0 inset-x-0 z-30 border-b border-[#E5E5E5] bg-[#FFFFFF]/95 backdrop-blur">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-10 h-14 sm:h-16 flex items-center justify-between gap-3">
          <Link
            href="/"
            className="text-[15px] sm:text-[16px] font-semibold tracking-tight text-[#1A1A1A] shrink-0"
          >
            EscrowPay
          </Link>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              href="/login"
              className="h-8 sm:h-9 px-3.5 sm:px-4 rounded-full border border-[#E5E5E5] text-[12px] sm:text-[13px] font-medium text-[#1A1A1A] inline-flex items-center hover:bg-[#F4F3EF] active:scale-[0.98] transition-all whitespace-nowrap"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="h-8 sm:h-9 px-3.5 sm:px-4 rounded-full bg-[#1A1A1A] text-[12px] sm:text-[13px] font-medium text-[#FFFFFF] inline-flex items-center hover:bg-[#1A1A1A]/90 active:scale-[0.98] transition-all whitespace-nowrap"
            >
              Create Store
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-14 sm:pt-16 flex items-center">
        <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-10 py-10 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <div className="lg:col-span-6 min-w-0 animate-fade-up">
              <h1 className="text-[32px] sm:text-[46px] lg:text-[52px] font-semibold tracking-[-0.025em] text-[#1A1A1A] leading-[1.1]">
                Sell Online without blind trust.
              </h1>
              <p className="mt-4 sm:mt-5 text-[15px] sm:text-[17px] text-[#5F6368] leading-relaxed max-w-[520px]">
                Create a product link in seconds. Your buyer pays in Naira with
                zero signup, receives a 6-digit release code, and funds release
                to you as soon as delivery is confirmed.
              </p>

              <div className="mt-7 sm:mt-8 flex flex-col sm:flex-row sm:items-center gap-3">
                <Link
                  href="/signup"
                  className="w-full sm:w-auto h-12 px-7 rounded-full bg-[#1A1A1A] text-[#FFFFFF] text-[14px] font-medium inline-flex items-center justify-center hover:bg-[#1A1A1A]/90 active:scale-[0.98] transition-all"
                >
                  Create Seller Account →
                </Link>
                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto h-12 px-7 rounded-full border border-[#E5E5E5] text-[#1A1A1A] text-[14px] font-medium inline-flex items-center justify-center hover:bg-[#F4F3EF] active:scale-[0.98] transition-all"
                >
                  Go to Dashboard
                </Link>
              </div>
            </div>

            <div
              className="lg:col-span-6 min-w-0 animate-fade-up"
              style={{ animationDelay: "90ms" }}
            >
              <EscrowFlowDemo />
            </div>
          </div>

          <div className="mt-12 sm:mt-16 lg:mt-20 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            <div
              className="rounded-2xl bg-[#F8F6F1] border border-[#ECE8DF] p-5 sm:p-6 hover:border-[#D6D0C2] hover:-translate-y-0.5 transition-all duration-200 animate-fade-up"
              style={{ animationDelay: "120ms" }}
            >
              <div className="flex items-center justify-between">
                <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5F6368]">
                  01 · SHARE LINK
                </p>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#5F6368"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              </div>
              <p className="mt-3 text-[15px] font-medium text-[#1A1A1A]">
                Rich WhatsApp preview
              </p>
              <p className="mt-1.5 text-[14px] text-[#5F6368] leading-relaxed">
                Drop your pay link directly into any DM or status with photo and
                Naira price.
              </p>
            </div>

            <div
              className="rounded-2xl bg-[#F8F6F1] border border-[#ECE8DF] p-5 sm:p-6 hover:border-[#D6D0C2] hover:-translate-y-0.5 transition-all duration-200 animate-fade-up"
              style={{ animationDelay: "180ms" }}
            >
              <div className="flex items-center justify-between">
                <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5F6368]">
                  02 · BUYER PAYS
                </p>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#8A5A00"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <p className="mt-3 text-[15px] font-medium text-[#1A1A1A]">
                Zero-signup checkout
              </p>
              <p className="mt-1.5 text-[14px] text-[#5F6368] leading-relaxed">
                Funds lock inside a timed delivery window with a private 6-digit
                release code.
              </p>
            </div>

            <div
              className="rounded-2xl bg-[#F8F6F1] border border-[#ECE8DF] p-5 sm:p-6 hover:border-[#D6D0C2] hover:-translate-y-0.5 transition-all duration-200 animate-fade-up"
              style={{ animationDelay: "240ms" }}
            >
              <div className="flex items-center justify-between">
                <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5F6368]">
                  03 · DELIVER &amp; EARN
                </p>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1E6B3A"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <path d="m9 11 3 3L22 4" />
                </svg>
              </div>
              <p className="mt-3 text-[15px] font-medium text-[#1A1A1A]">
                Instant Naira release
              </p>
              <p className="mt-1.5 text-[14px] text-[#5F6368] leading-relaxed">
                Enter the buyer&apos;s 6-digit code at handoff to settle funds
                immediately.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Warm Editorial Footer */}
      <footer className="w-full border-t border-[#E5E5E5] bg-[#FAF9F6]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-10 py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-[14px] font-semibold tracking-tight text-[#1A1A1A]">
              EscrowPay
            </p>
            <p className="mt-1 text-[13px] text-[#5F6368]">
              Protected Naira payment links for social commerce.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-[13px] text-[#5F6368]">
            <Link href="/signup" className="hover:text-[#1A1A1A] transition-colors">
              Create Store
            </Link>
            <Link href="/login" className="hover:text-[#1A1A1A] transition-colors">
              Sign in
            </Link>
            <Link href="/dashboard" className="hover:text-[#1A1A1A] transition-colors">
              Dashboard
            </Link>
            <span className="font-mono text-[11px] text-[#5F6368]/80">
              © 2026 EscrowPay
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
