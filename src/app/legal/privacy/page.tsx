import type { Metadata } from "next";
import { LegalDocument, Section } from "@/components/legal/LegalDocument";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Privacy Policy · EscrowPay",
  description: "How EscrowPay collects, uses and protects personal data under the Nigeria Data Protection Act 2023.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalDocument
      eyebrow="Privacy Policy"
      title="Privacy Policy"
      summary="What personal data we collect, why we need it, who we share it with, and your rights under the Nigeria Data Protection Act 2023."
      activeHref="/legal/privacy"
    >
      <Section id="controller" title="1. Who is responsible for your data">
        <p>
          {LEGAL.entityName}, {LEGAL.registeredAddress}, is the data controller for personal data
          processed through {LEGAL.brand}. You can contact our Data Protection Officer at{" "}
          <a href={`mailto:${LEGAL.privacyEmail}`}>{LEGAL.privacyEmail}</a>. We process personal
          data in line with the Nigeria Data Protection Act 2023 (NDPA) and the directives of the
          Nigeria Data Protection Commission (NDPC).
        </p>
      </Section>

      <Section id="collect" title="2. What we collect">
        <p>
          <strong>Buyers</strong> (no account needed):
        </p>
        <ul>
          <li>Full name, phone number, email address and delivery address entered at checkout.</li>
          <li>The order, amount, delivery deadline, any dispute description, and order status.</li>
          <li>
            Payment confirmation from our payment partner. We do not receive or store your card
            number, PIN or bank login.
          </li>
        </ul>
        <p>
          <strong>Sellers</strong>:
        </p>
        <ul>
          <li>Email address and password (stored only as a secure hash by our login provider).</li>
          <li>Business name, and optional WhatsApp number and Instagram handle.</li>
          <li>The products you list, your orders, and your payout history.</li>
        </ul>
        <p>
          <strong>Everyone</strong>: essential cookies (see section 7), and basic technical logs
          such as IP address, browser type and error reports, used to keep the service secure and
          working.
        </p>
      </Section>

      <Section id="use" title="3. Why we use it and our lawful basis">
        <ul>
          <li>
            <strong>To perform our contract with you:</strong> processing payments, holding and
            releasing escrow, sharing the delivery details a seller needs to ship your order, and
            sending order and verification emails.
          </li>
          <li>
            <strong>Legal obligations:</strong> keeping transaction records and preventing fraud,
            money laundering and terrorism financing, as required by Nigerian law.
          </li>
          <li>
            <strong>Legitimate interests:</strong> securing accounts and order links, resolving
            disputes, and fixing errors. We balance these against your rights and do not use them to
            override them.
          </li>
          <li>
            <strong>Consent:</strong> for anything else, such as marketing emails. We do not
            currently send marketing, and we will ask first if we ever do. You can withdraw consent
            at any time.
          </li>
        </ul>
        <p>We do not sell personal data, and we do not use it for automated decisions about you.</p>
      </Section>

      <Section id="sharing" title="4. Who we share it with">
        <ul>
          <li>
            <strong>The seller you buy from</strong> receives your name, phone number, email
            address and delivery address so they can contact you and deliver your order. Sellers
            may only use these details for that order.
          </li>
          <li>
            <strong>Service providers</strong> who process data on our behalf under written
            contracts: our payment processor (Paystack), our database, hosting and login providers,
            our email delivery provider, and our account-security provider.
          </li>
          <li>
            <strong>Settlement ledger:</strong> the escrow record described in our Escrow Agreement
            is kept on the public Stellar network. It shows amounts and anonymous account
            identifiers only, never your name or contact details.
          </li>
          <li>
            <strong>Authorities</strong> where the law requires us to, for example a court order or
            a lawful request from a regulator or law enforcement.
          </li>
        </ul>
      </Section>

      <Section id="transfers" title="5. International transfers">
        <p>
          Some of our service providers store or process data outside Nigeria, including in the
          United States and the European Union. We only transfer data where the NDPA allows it,
          for example where the recipient country has adequate protection, under contractual
          safeguards, or where it is needed to perform our contract with you.
        </p>
      </Section>

      <Section id="retention" title="6. How long we keep it">
        <ul>
          <li>
            Order and transaction records: 5 years after the order is completed, as required for
            anti-money-laundering record keeping.
          </li>
          <li>Seller accounts: while the account is open, then 5 years for transaction records.</li>
          <li>Technical and error logs: up to 90 days.</li>
          <li>Verification codes: deleted or invalidated within 10 minutes.</li>
        </ul>
        <p>
          Entries already recorded on the public settlement ledger cannot be deleted. They contain
          no personal contact details.
        </p>
      </Section>

      <Section id="cookies" title="7. Cookies">
        <p>We only use cookies that are needed for the service to work:</p>
        <ul>
          <li>A seller login session cookie.</li>
          <li>
            A secure order-access cookie that links a buyer&apos;s browser to their order for 30
            days, so nobody else with the link can see the release code.
          </li>
          <li>A short-lived cookie (10 minutes) that holds an email verification challenge.</li>
        </ul>
        <p>We do not use advertising or third-party tracking cookies.</p>
      </Section>

      <Section id="security" title="8. Security">
        <p>
          We encrypt data in transit and use encryption and hashing to protect release codes and
          verification codes. Access to personal data is limited to people who need it. If a
          personal data breach is likely to put your rights at risk, we will notify the NDPC within
          72 hours and tell you without undue delay.
        </p>
      </Section>

      <Section id="rights" title="9. Your rights">
        <p>Under the NDPA you have the right to:</p>
        <ul>
          <li>be told how your data is used, and get a copy of it;</li>
          <li>have inaccurate data corrected;</li>
          <li>have data deleted where we no longer have a lawful reason to keep it;</li>
          <li>restrict or object to some processing;</li>
          <li>receive your data in a portable format;</li>
          <li>withdraw consent where processing is based on consent.</li>
        </ul>
        <p>
          Email <a href={`mailto:${LEGAL.privacyEmail}`}>{LEGAL.privacyEmail}</a> to use these
          rights. We will reply within 30 days. If you are not satisfied, you can complain to the
          Nigeria Data Protection Commission (ndpc.gov.ng).
        </p>
      </Section>

      <Section id="children" title="10. Children">
        <p>
          {LEGAL.brand} is not intended for anyone under 18, and we do not knowingly collect their
          data.
        </p>
      </Section>

      <Section id="changes" title="11. Changes">
        <p>
          We will post any update to this policy here with a new &ldquo;Last updated&rdquo; date,
          and email sellers about material changes.
        </p>
      </Section>
    </LegalDocument>
  );
}
