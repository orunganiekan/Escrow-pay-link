import Link from "next/link";
import { EscrowFlowDemo } from "@/components/landing/EscrowFlowDemo";
import { LEGAL_LINKS } from "@/lib/legal";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FFFFFF] flex flex-col overflow-x-clip">
      {/* Persistent Fixed Navbar */}
      <header className="fixed top-0 inset-x-0 z-30 border-b border-[#E5E5E5] bg-[#FFFFFF]/95 backdrop-blur">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-10 h-14 sm:h-16 flex items-center justify-between gap-3">
          <Link
            href="/"
            className="font-display text-[16px] font-medium tracking-[-0.02em] text-[#1A1A1A] shrink-0"
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
              className="h-8 sm:h-9 px-3.5 sm:px-4 rounded-full bg-[#1A1A1A] text-[12px] sm:text-[13px] font-medium text-[#FFFFFF] inline-flex items-center hover:bg-[#2E2E2E] active:scale-[0.98] transition-all whitespace-nowrap"
            >
              Create Store
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-14 sm:pt-16">
        {/* Hero Band (Pure Paper) */}
        <section className="bg-[#FFFFFF]">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-10 py-10 sm:py-16 lg:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              <div className="lg:col-span-5 min-w-0 animate-fade-up">
                <h1 className="font-display font-medium text-[34px] sm:text-[48px] lg:text-[52px] tracking-[-0.025em] text-[#1A1A1A] leading-[1.08]">
                  Sell Online without blind trust.
                </h1>
                <p className="mt-5 text-[15px] sm:text-[16px] text-[#5F6368] leading-[1.65] max-w-[46ch]">
                  Share a single Naira payment link in WhatsApp or Instagram
                  DMs. Your buyer pays with zero signup, holds a 6-digit release
                  code, and funds settle the moment the parcel lands in their
                  hands.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-3">
                  <Link
                    href="/signup"
                    className="w-full sm:w-auto h-12 px-7 rounded-full bg-[#1A1A1A] text-[#FFFFFF] text-[14px] font-medium inline-flex items-center justify-center hover:bg-[#2E2E2E] active:scale-[0.98] transition-all"
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
                className="lg:col-span-7 min-w-0 animate-fade-up"
                style={{ animationDelay: "80ms" }}
              >
                <EscrowFlowDemo />
              </div>
            </div>
          </div>
        </section>

        {/* How It Works — Warm Alabaster Editorial Ledger */}
        <section className="bg-[#F8F6F1] border-y border-[#E5E5E5]">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-10 py-14 sm:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
              <div className="lg:col-span-4">
                <h2 className="font-display font-medium text-[26px] sm:text-[32px] tracking-[-0.02em] text-[#1A1A1A] leading-[1.2]">
                  Three steps from DM to payout.
                </h2>
                <p className="mt-3 text-[14px] sm:text-[15px] text-[#5F6368] leading-relaxed">
                  Designed for the way people already buy and sell on WhatsApp
                  and Instagram — without forcing buyers to create an account.
                </p>
              </div>

              <ol className="lg:col-span-8 divide-y divide-[#E5E0D5] border-t border-b border-[#E5E0D5]">
                <li className="py-6 sm:py-7 grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6 items-baseline">
                  <span className="font-mono text-[12px] text-[#8A5A00] sm:col-span-2">
                    01
                  </span>
                  <div className="sm:col-span-10">
                    <h3 className="font-display font-medium text-[18px] text-[#1A1A1A]">
                      Paste a pay link, not an account number
                    </h3>
                    <p className="mt-1.5 text-[14px] text-[#5F6368] leading-relaxed max-w-[58ch]">
                      Create a link with your product photo, Naira price, and
                      delivery window. Buyers see your real completion record
                      right inside the link preview.
                    </p>
                  </div>
                </li>

                <li className="py-6 sm:py-7 grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6 items-baseline">
                  <span className="font-mono text-[12px] text-[#8A5A00] sm:col-span-2">
                    02
                  </span>
                  <div className="sm:col-span-10">
                    <h3 className="font-display font-medium text-[18px] text-[#1A1A1A]">
                      Buyer pays in seconds — funds stay locked
                    </h3>
                    <p className="mt-1.5 text-[14px] text-[#5F6368] leading-relaxed max-w-[58ch]">
                      No app download, no password. Buyers pay via bank
                      transfer, card, or USSD and immediately receive a private
                      6-digit release code.
                    </p>
                  </div>
                </li>

                <li className="py-6 sm:py-7 grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6 items-baseline">
                  <span className="font-mono text-[12px] text-[#8A5A00] sm:col-span-2">
                    03
                  </span>
                  <div className="sm:col-span-10">
                    <h3 className="font-display font-medium text-[18px] text-[#1A1A1A]">
                      Code at the door, Naira in your balance
                    </h3>
                    <p className="mt-1.5 text-[14px] text-[#5F6368] leading-relaxed max-w-[58ch]">
                      When the order arrives, the buyer shares their 6-digit
                      code and your balance updates immediately. If an item is
                      never delivered, the buyer claims a full refund once the
                      window expires.
                    </p>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </section>

        {/* Both Sides of the Chat — Pure Paper Editorial Split */}
        <section className="bg-[#FFFFFF]">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-10 py-14 sm:py-20">
            <h2 className="font-display font-medium text-[26px] sm:text-[32px] tracking-[-0.02em] text-[#1A1A1A] leading-[1.2] max-w-[24ch]">
              Built for both sides of the chat.
            </h2>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
              <div>
                <h3 className="font-display font-medium text-[18px] text-[#1A1A1A]">
                  For buyers tired of &ldquo;pay before delivery&rdquo;
                </h3>
                <ul className="mt-4 divide-y divide-[#E5E5E5] border-t border-[#E5E5E5] text-[14px] text-[#5F6368]">
                  <li className="py-3.5">
                    Zero signup — enter your delivery address and pay in under a
                    minute.
                  </li>
                  <li className="py-3.5">
                    Your 6-digit release code stays private until you inspect
                    the package.
                  </li>
                  <li className="py-3.5">
                    Automatic full refund unlocks if the delivery deadline
                    passes.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-display font-medium text-[18px] text-[#1A1A1A]">
                  For sellers tired of losing orders to hesitation
                </h3>
                <ul className="mt-4 divide-y divide-[#E5E5E5] border-t border-[#E5E5E5] text-[14px] text-[#5F6368]">
                  <li className="py-3.5">
                    See confirmed, locked Naira before you ever book a dispatch
                    rider.
                  </li>
                  <li className="py-3.5">
                    Set delivery windows that match how your store actually
                    ships.
                  </li>
                  <li className="py-3.5">
                    Every completed order builds your verified completion rate
                    on future links.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Quiet Closing CTA Band */}
        <section className="bg-[#F8F6F1] border-t border-[#E5E5E5]">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-10 py-14 sm:py-16 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <h2 className="font-display font-medium text-[24px] sm:text-[28px] tracking-[-0.02em] text-[#1A1A1A]">
                Ready to send your first protected pay link?
              </h2>
              <p className="mt-1.5 text-[14px] text-[#5F6368]">
                Set up your store profile in under a minute and share on
                WhatsApp.
              </p>
            </div>
            <Link
              href="/signup"
              className="w-full sm:w-auto h-12 px-7 rounded-full bg-[#1A1A1A] text-[#FFFFFF] text-[14px] font-medium inline-flex items-center justify-center hover:bg-[#2E2E2E] active:scale-[0.98] transition-all shrink-0"
            >
              Create Seller Account →
            </Link>
          </div>
        </section>
      </main>

      {/* Warm Editorial Footer */}
      <footer className="w-full border-t border-[#E5E5E5] bg-[#FFFFFF]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-10 py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="font-display text-[14px] font-medium tracking-[-0.01em] text-[#1A1A1A]">
              EscrowPay
            </p>
            <p className="mt-1 text-[13px] text-[#5F6368]">
              Protected Naira payment links for social commerce.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-[13px] text-[#5F6368]">
            <Link
              href="/signup"
              className="hover:text-[#1A1A1A] transition-colors"
            >
              Create Store
            </Link>
            <Link
              href="/login"
              className="hover:text-[#1A1A1A] transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/dashboard"
              className="hover:text-[#1A1A1A] transition-colors"
            >
              Dashboard
            </Link>
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-[#1A1A1A] transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <span className="font-mono text-[11px] text-[#5F6368]/80">
              © 2026 EscrowPay
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
