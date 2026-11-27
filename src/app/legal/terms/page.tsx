import type { Metadata } from "next";
import Link from "next/link";
import { LegalDocument, Section } from "@/components/legal/LegalDocument";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Terms of Service · EscrowPay",
  description: "The rules for buying and selling with EscrowPay protected payment links.",
};

export default function TermsPage() {
  return (
    <LegalDocument
      eyebrow="Terms of Service"
      title="Terms of Service"
      summary="The rules for buyers and sellers who use EscrowPay protected Naira payment links."
      activeHref="/legal/terms"
    >
      <Section id="who-we-are" title="1. Who we are">
        <p>
          {LEGAL.brand} (&ldquo;we&rdquo;, &ldquo;us&rdquo;) is operated by {LEGAL.entityName}
          {LEGAL.rcNumber ? `, ${LEGAL.rcNumber}` : ""}, {LEGAL.registeredAddress}. We provide a
          technology service that lets sellers on WhatsApp, Instagram and similar channels share
          payment links, and lets buyers pay into a protected escrow that is only paid out when
          the buyer confirms delivery.
        </p>
        <p>
          We are not the seller of any item and are not a party to the sale between buyer and
          seller. We are not a bank.{" "}
          {LEGAL.fundsCustodian
            ? `Customer funds are collected and held by ${LEGAL.fundsCustodian}, a licensed payment service provider.`
            : "Before we accept real payments, customer funds will be collected and held through a licensed Nigerian payment service provider or trustee, which we will name here."}
        </p>
      </Section>

      <Section id="accepting" title="2. Accepting these terms">
        <p>
          By creating a seller account, or by paying through an {LEGAL.brand} link, you agree to
          these Terms, the <Link href="/legal/escrow">Escrow Agreement</Link> and our{" "}
          <Link href="/legal/privacy">Privacy Policy</Link>. If you do not agree, do not use the
          service. You must be at least 18 years old and able to enter a binding contract under
          Nigerian law.
        </p>
      </Section>

      <Section id="sellers" title="3. Seller obligations">
        <ul>
          <li>Give accurate business and contact details and keep them up to date.</li>
          <li>
            Describe each item honestly, including its price in Naira, condition and the delivery
            window you commit to.
          </li>
          <li>
            Ship only after the order shows <strong>Payment secured</strong>, and deliver within the
            stated delivery window.
          </li>
          <li>
            Ask the buyer for the 6-digit release code only when they have received the item. Never
            pressure a buyer to share it early.
          </li>
          <li>
            Comply with all laws that apply to your business, including consumer protection, tax and
            product safety rules.
          </li>
        </ul>
      </Section>

      <Section id="buyers" title="4. Buyer obligations">
        <ul>
          <li>Give a correct name, phone number, email and delivery address at checkout.</li>
          <li>
            Keep your release code private. Share it with the seller only after you have received
            and checked your item. Sharing the code tells us to pay the seller.
          </li>
          <li>Report a problem before the delivery window ends if the item is wrong or missing.</li>
        </ul>
      </Section>

      <Section id="prohibited" title="5. Prohibited items and conduct">
        <p>You may not use {LEGAL.brand} to sell, buy or promote:</p>
        <ul>
          <li>Items that are illegal in Nigeria, counterfeit, stolen or recalled.</li>
          <li>
            Weapons, controlled drugs, prescription medicines without authorisation, or hazardous
            materials.
          </li>
          <li>Gambling, investment schemes, loans, currency exchange or any financial product.</li>
          <li>Anything that facilitates fraud, money laundering or the financing of terrorism.</li>
        </ul>
        <p>
          We may refuse, pause or reverse a transaction, freeze funds, or close an account where we
          reasonably suspect a breach of these Terms or the law, and we may report suspicious
          activity to the authorities as required by law.
        </p>
      </Section>

      <Section id="fees" title="6. Fees">
        <p>
          {LEGAL.brand} does not currently charge buyers or sellers a service fee. Payment
          processing charges may be applied by our payment partner. We will show any fee clearly
          before you pay or create a link, and we will give sellers at least 30 days&apos; notice
          before introducing or changing fees.
        </p>
      </Section>

      <Section id="disputes" title="7. Disputes between buyers and sellers">
        <p>
          The <Link href="/legal/escrow">Escrow Agreement</Link> explains how payments are held,
          released, refunded and reviewed. Our decision on a dispute decides only where the
          escrowed payment goes. It does not stop either party from pursuing other remedies
          against the other under Nigerian law, including through the Federal Competition and
          Consumer Protection Commission.
        </p>
      </Section>

      <Section id="accounts" title="8. Accounts and security">
        <p>
          You are responsible for keeping your login details and any codes we send you secure. Tell
          us immediately at <a href={`mailto:${LEGAL.supportEmail}`}>{LEGAL.supportEmail}</a> if you
          think your account or an order link has been accessed without your permission.
        </p>
      </Section>

      <Section id="liability" title="9. Our liability">
        <p>
          We will take reasonable care in running the service and in handling escrowed payments
          according to the Escrow Agreement. We are not responsible for the quality, safety,
          legality or delivery of items sold by sellers, or for losses caused by events outside our
          reasonable control. To the extent permitted by law, our total liability to you for any
          claim is limited to the amount of the payment involved in that claim. Nothing in these
          Terms limits liability that cannot be limited under Nigerian law.
        </p>
      </Section>

      <Section id="suspension" title="10. Suspension and closing accounts">
        <p>
          Sellers can stop using the service at any time. Orders that are already paid must still be
          completed, refunded or resolved under the Escrow Agreement. We may suspend or close an
          account for a breach of these Terms, suspected fraud, or where required by law or by our
          payment partners.
        </p>
      </Section>

      <Section id="changes" title="11. Changes to these terms">
        <p>
          We may update these Terms. We will post the new version here with a new &ldquo;Last
          updated&rdquo; date and, for material changes, notify sellers by email. Payments made
          before a change are governed by the Terms in force when they were made.
        </p>
      </Section>

      <Section id="law" title="12. Governing law">
        <p>
          These Terms are governed by the laws of the Federal Republic of Nigeria. The courts of
          Lagos State have jurisdiction over any dispute that we cannot resolve with you informally.
        </p>
      </Section>
    </LegalDocument>
  );
}
