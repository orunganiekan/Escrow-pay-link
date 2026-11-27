import type { Metadata } from "next";
import Link from "next/link";
import { LegalDocument, Section } from "@/components/legal/LegalDocument";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Escrow Agreement · EscrowPay",
  description: "How EscrowPay holds, releases and refunds payments between buyers and sellers.",
};

export default function EscrowAgreementPage() {
  return (
    <LegalDocument
      eyebrow="Escrow Agreement"
      title="Escrow Agreement"
      summary="How your payment is held, when it is paid to the seller, and when it is refunded to you."
      activeHref="/legal/escrow"
    >
      <Section id="parties" title="1. Parties">
        <p>
          This agreement applies to every order paid through an {LEGAL.brand} link. The parties
          are the <strong>buyer</strong> who pays, the <strong>seller</strong> who created the
          link, and {LEGAL.entityName} (&ldquo;{LEGAL.brand}&rdquo;), which acts as the neutral
          escrow agent for both of them. It forms part of our{" "}
          <Link href="/legal/terms">Terms of Service</Link>.
        </p>
      </Section>

      <Section id="holding" title="2. How payments are held">
        <p>
          When the buyer pays in Naira, the full amount is held in escrow and is not available to
          the seller until it is released under section 4.{" "}
          {LEGAL.fundsCustodian
            ? `Funds are held through ${LEGAL.fundsCustodian}.`
            : "Before real payments are accepted, funds will be held through a licensed Nigerian payment service provider or trustee, named here."}{" "}
          Each escrow is also recorded on a tamper-evident settlement ledger, so that its creation,
          release or refund can be independently verified. That record contains no names, phone
          numbers, emails or addresses.
        </p>
        <p>
          {LEGAL.brand} does not use escrowed funds for its own purposes, and does not pay interest
          on them.
        </p>
      </Section>

      <Section id="window" title="3. Delivery window">
        <p>
          Each link shows a delivery window chosen by the seller, for example 24 hours or 7 days.
          The window starts when the payment is confirmed, and the deadline is shown to both
          parties on the order page.
        </p>
      </Section>

      <Section id="release" title="4. Release to the seller">
        <p>
          After payment, the buyer receives a private <strong>6-digit release code</strong>. When
          the buyer has received the item, they give the code to the seller, who enters it to
          release the payment.
        </p>
        <ul>
          <li>
            Giving the release code to the seller is the buyer&apos;s irrevocable instruction to pay
            the seller. Once released, the payment cannot be refunded through {LEGAL.brand}.
          </li>
          <li>The code only works before the delivery deadline and while no dispute is open.</li>
          <li>
            After 5 incorrect attempts the code is locked to protect the buyer. The payment then
            stays in escrow until it is refunded or resolved under sections 5 and 6.
          </li>
        </ul>
      </Section>

      <Section id="refund" title="5. Refund to the buyer">
        <p>
          If the payment has not been released by the delivery deadline, the buyer can claim a{" "}
          <strong>full refund</strong> from the order page at any time after the deadline. The
          seller cannot release the payment after the deadline has passed.
        </p>
      </Section>

      <Section id="disputes" title="6. Disputes">
        <p>
          Before the deadline, the buyer can report a problem from the order page, for example a
          missing, damaged or wrong item. This <strong>freezes</strong> the payment so the seller
          cannot release it.
        </p>
        <ul>
          <li>
            {LEGAL.brand} reviews the dispute and may ask either party for evidence such as photos,
            chat history, or courier tracking.
          </li>
          <li>
            We then either release the payment to the seller or refund it in full to the buyer. We
            act impartially and base the decision on the evidence available to us.
          </li>
          <li>
            If a dispute has not been resolved by the delivery deadline, the buyer may claim a full
            refund under section 5.
          </li>
        </ul>
      </Section>

      <Section id="verification" title="7. Order access and verification">
        <p>
          Order pages are protected. On a new browser or device, the buyer must enter a one-time
          code sent to the email used at checkout before they can see the release code, open a
          dispute or claim a refund. Anyone who has the order link but not the code cannot act on
          the order.
        </p>
      </Section>

      <Section id="holds" title="8. Holds required by law">
        <p>
          We may delay a release or refund, or hold funds, where we reasonably suspect fraud, where
          our payment partner requires it, or where the law or a lawful order requires it. We will
          tell the affected parties unless the law prevents us from doing so.
        </p>
      </Section>

      <Section id="ends" title="9. When this agreement ends">
        <p>
          This agreement ends for an order once the payment has been released to the seller or
          refunded to the buyer.
        </p>
      </Section>
    </LegalDocument>
  );
}
