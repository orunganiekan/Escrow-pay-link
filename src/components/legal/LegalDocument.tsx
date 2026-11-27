import Link from "next/link";
import type { ReactNode } from "react";
import { LEGAL, LEGAL_LINKS } from "@/lib/legal";

export function LegalDocument({
  eyebrow,
  title,
  summary,
  activeHref,
  children,
}: {
  eyebrow: string;
  title: string;
  summary: string;
  activeHref: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8F6F1] flex flex-col">
      <header className="w-full border-b border-[#E5E5E5] bg-[#FFFFFF]">
        <div className="max-w-[760px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="font-display text-[16px] font-medium tracking-[-0.02em] text-[#1A1A1A]"
          >
            {LEGAL.brand}
          </Link>
          <nav aria-label="Legal documents" className="flex gap-1 overflow-x-auto text-[13px]">
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={link.href === activeHref ? "page" : undefined}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 transition-colors ${
                  link.href === activeHref
                    ? "bg-[#1A1A1A] text-[#FFFFFF]"
                    : "text-[#5F6368] hover:text-[#1A1A1A] hover:bg-[#F4F3EF]"
                }`}
              >
                {link.label.replace(" of Service", "").replace(" Policy", "").replace(" Agreement", "")}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[760px] mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5F6368]">
          {eyebrow} · Last updated {LEGAL.lastUpdated}
        </p>
        <h1 className="mt-2 font-display font-medium text-[24px] leading-[32px] sm:text-[30px] sm:leading-[38px] tracking-[-0.02em] text-[#1A1A1A]">
          {title}
        </h1>
        <p className="mt-3 text-[16px] leading-[24px] text-[#5F6368]">{summary}</p>

        {LEGAL.pendingLegalReview ? (
          <div
            role="note"
            className="mt-6 rounded-xl border border-[#F5D58A] bg-[#FFF4D6] px-4 py-3 text-[13px] leading-[20px] text-[#8A5A00]"
          >
            <strong className="font-medium">Draft for review.</strong> This document is being
            finalised with Nigerian counsel before EscrowPay accepts real payments. While the
            service runs in test mode, no real money is collected or held.
          </div>
        ) : null}

        <article className="mt-8 rounded-xl border border-[#E5E5E5] bg-[#FFFFFF] px-5 py-6 sm:px-8 sm:py-8">
          {children}
        </article>

        <p className="mt-6 text-[13px] text-[#5F6368]">
          Questions? Email{" "}
          <a
            href={`mailto:${LEGAL.supportEmail}`}
            className="text-[#1A1A1A] underline underline-offset-4"
          >
            {LEGAL.supportEmail}
          </a>
          .
        </p>
      </main>

      <footer className="w-full border-t border-[#E5E5E5] bg-[#FFFFFF]">
        <div className="max-w-[760px] mx-auto px-4 sm:px-6 py-6 flex flex-wrap items-center justify-between gap-3 text-[12px] text-[#5F6368]">
          <span>
            {LEGAL.entityName}
            {LEGAL.rcNumber ? ` · ${LEGAL.rcNumber}` : ""} · {LEGAL.registeredAddress}
          </span>
          <span className="font-mono text-[11px]">© 2026 {LEGAL.brand}</span>
        </div>
      </footer>
    </div>
  );
}

export function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 [&+&]:mt-8">
      <h2 className="font-display font-medium text-[17px] leading-[24px] tracking-[-0.01em] text-[#1A1A1A]">
        {title}
      </h2>
      <div className="mt-2 space-y-3 text-[14px] leading-[22px] text-[#3C4043] [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_strong]:font-medium [&_strong]:text-[#1A1A1A] [&_a]:text-[#1A1A1A] [&_a]:underline [&_a]:underline-offset-4">
        {children}
      </div>
    </section>
  );
}
