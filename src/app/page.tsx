import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#FFFFFF] flex flex-col">
      <header className="w-full border-b border-[#E5E5E5]">
        <div className="max-w-[1280px] mx-auto px-6 sm:px-10 h-16 flex items-center justify-between">
          <span className="text-[16px] font-semibold tracking-tight text-[#1A1A1A]">
            EscrowPay
          </span>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="h-9 px-4 rounded-full border border-[#E5E5E5] text-[13px] font-medium text-[#1A1A1A] inline-flex items-center hover:bg-[#F4F3EF]"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="h-9 px-4 rounded-full bg-[#1A1A1A] text-[13px] font-medium text-[#FFFFFF] inline-flex items-center hover:bg-[#1A1A1A]/90"
            >
              Create Store
            </Link>
          </div>
        </div>
      </header>

      <section className="flex-1 flex items-center">
        <div className="max-w-[1280px] w-full mx-auto px-6 sm:px-10 py-14 sm:py-20">
          <div className="max-w-[660px]">
            <h1 className="text-[40px] sm:text-[52px] font-semibold tracking-[-0.025em] text-[#1A1A1A] leading-[1.08]">
              Sell Online without blind trust.
            </h1>
            <p className="mt-5 text-[16px] sm:text-[17px] text-[#5F6368] leading-relaxed max-w-[540px]">
              Create a product link in seconds. Your buyer pays in Naira with
              zero signup, receives a 6-digit release code, and funds release to
              you as soon as delivery is confirmed.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/signup"
                className="h-12 px-7 rounded-full bg-[#1A1A1A] text-[#FFFFFF] text-[14px] font-medium inline-flex items-center hover:bg-[#1A1A1A]/90"
              >
                Create Seller Account →
              </Link>
              <Link
                href="/dashboard"
                className="h-12 px-7 rounded-full border border-[#E5E5E5] text-[#1A1A1A] text-[14px] font-medium inline-flex items-center hover:bg-[#F4F3EF]"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="rounded-2xl bg-[#F8F6F1] p-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5F6368]">
                01 · SHARE LINK
              </p>
              <p className="mt-2.5 text-[15px] font-medium text-[#1A1A1A]">
                Rich WhatsApp preview
              </p>
              <p className="mt-1.5 text-[14px] text-[#5F6368] leading-relaxed">
                Drop your pay link directly into any DM or status.
              </p>
            </div>
            <div className="rounded-2xl bg-[#F8F6F1] p-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5F6368]">
                02 · BUYER PAYS
              </p>
              <p className="mt-2.5 text-[15px] font-medium text-[#1A1A1A]">
                Zero-signup checkout
              </p>
              <p className="mt-1.5 text-[14px] text-[#5F6368] leading-relaxed">
                Funds lock inside a timed delivery window with a 6-digit code.
              </p>
            </div>
            <div className="rounded-2xl bg-[#F8F6F1] p-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5F6368]">
                03 · DELIVER & EARN
              </p>
              <p className="mt-2.5 text-[15px] font-medium text-[#1A1A1A]">
                Instant Naira release
              </p>
              <p className="mt-1.5 text-[14px] text-[#5F6368] leading-relaxed">
                Enter the buyer&apos;s 6-digit code at handoff to settle funds.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
