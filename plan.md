# Escrow Pay Links: Product Build Plan (Day 1)

## The target

By the end of today, this works on a **deployed URL**, with no terminal involved:

1. A test vendor **signs up** with email and password.
2. The vendor **creates a product** (name, photo, price in naira, delivery window) and gets a **shareable link**.
3. The vendor pastes the link into a WhatsApp chat. It shows a **link preview** (product name, price, photo).
4. A buyer opens the link on a phone, **pays** (simulated naira bank transfer), and never sees the word "wallet".
5. The vendor sees **"Payment secured, ship now"** on their dashboard.
6. On delivery the buyer gives a **release code**. The vendor enters it, and the money lands in the vendor's balance.
7. If the deadline passes with no release, the buyer is **refunded**.

Stellar testnet runs underneath (custodial accounts, claimable-balance escrow). Users see none of it. Judges can open a "Receipt on the chain" panel on any order.

## Decisions (made so nobody debates them today)

| Area | Choice | Why |
| --- | --- | --- |
| App | **Next.js (App Router) + TypeScript**, one repo | Frontend, API routes, and server code in one place |
| DB | **Postgres on Neon**, via **Prisma** | Works on Vercel, and the data model is relational |
| Auth | Email + password, bcrypt, session cookie (Auth.js credentials or Lucia) | Real signup without OAuth setup time |
| Hosting | **Vercel** | Gives the shareable URL and `og:` previews |
| Stellar | `@stellar/stellar-sdk`, testnet, Horizon | |
| Accounts | **Custodial**: the server creates and holds keys (AES-GCM encrypted with an env secret) | No wallet UX, and fastest to build. Label it "demo custody" in the pitch |
| Funding | One funded **TREASURY** account pays reserves for new accounts | Friendbot is rate-limited, so fund the treasury once and spend from it |
| Escrow | **Claimable balance**: `ESCROW` claims before the deadline (release), buyer claims after (refund) | No Rust. Sits behind an interface so Soroban can replace it later |
| Naira rail | **Simulated bank transfer**, clearly labelled as test mode | A real on-ramp needs a licensed anchor |
| Release code | 6 digits, stored as a hash, **shown to the buyer, entered by the vendor** | Matches the real flow: the buyer hands the code over on delivery |

## Data model (Prisma, sketch)

```prisma
model User {            // vendor account
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String
  businessName  String
  whatsapp      String?
  instagram     String?
  stellarPublic String
  stellarSecretEnc String          // AES-GCM encrypted
  createdAt     DateTime @default(now())
  products      Product[]
}

model Product {
  id          String  @id @default(cuid())
  slug        String  @unique      // short, used in /p/[slug]
  vendorId    String
  name        String
  description String?
  imageUrl    String?
  priceNgn    Decimal
  windowHours Int                  // delivery window
  active      Boolean @default(true)
  orders      Order[]
}

model Order {
  id              String  @id @default(cuid())
  token           String  @unique  // unguessable, used in /o/[token]
  productId       String
  buyerName       String
  buyerPhone      String
  buyerEmail      String?
  amountNgn       Decimal
  status          String           // PENDING_PAYMENT | SECURED | SHIPPED | RELEASED | REFUNDED | DISPUTED
  buyerStellarPublic    String
  buyerStellarSecretEnc String
  claimableBalanceId    String?
  codeHash        String
  deadline        DateTime?
  txCreate        String?
  txRelease       String?
  txRefund        String?
  createdAt       DateTime @default(now())
}
```

---

## Phase 0: Scaffold and deploy a skeleton (~45 min)

- [ ] `npx create-next-app@latest` (TypeScript, App Router, Tailwind). Add `prisma`, `@prisma/client`, `@stellar/stellar-sdk`, `bcryptjs`, `zod`.
- [ ] Create a Neon database and put `DATABASE_URL` in `.env` and in Vercel.
- [ ] Add the schema above, run `prisma migrate dev`.
- [ ] Push to GitHub, connect Vercel, **deploy a hello-world page now**. Deploy problems are cheaper to find at 10am than at 10pm.
- [ ] `.env.example` with: `DATABASE_URL`, `ENCRYPTION_KEY`, `TREASURY_SECRET`, `ESCROW_SECRET`, `ISSUER_SECRET`, `BANK_WEBHOOK_SECRET`, `SESSION_SECRET`.

**Done when:** a public Vercel URL loads and can read and write one DB row.

## Phase 1: Stellar foundation, as a server library (~75 min)

Everything Stellar lives in `src/server/stellar/`. The UI never imports from it.

- [ ] `scripts/bootstrap.ts` (run once locally): create and fund `TREASURY`, `ISSUER`, and `ESCROW` with Friendbot. Issue test **NGN**. Give `ESCROW` an NGN trustline. Print the secrets for `.env`.
- [ ] `createCustodialAccount()`: generate a keypair, fund it from `TREASURY` (`createAccount`), add an NGN trustline in the same transaction. Return the public key and the encrypted secret.
- [ ] `encrypt()` and `decrypt()` (AES-256-GCM) for secrets.
- [ ] `mintTestNgn(toPublic, amount)`: a payment from `ISSUER`. This is the simulated bank rail.
- [ ] `EscrowService` interface plus `ClaimableBalanceEscrow` with `create`, `release`, `refund`, `status`:
  - Create: a claimable balance funded by the buyer account. Claimants: `ESCROW` with `predicateBeforeAbsoluteTime(deadline)`, and the buyer with `predicateNot(predicateBeforeAbsoluteTime(deadline))`.
  - Release: `ESCROW` claims, then pays the vendor's account, in one transaction.
  - Refund: the buyer claims after the deadline.
- [ ] A `scripts/smoke-escrow.ts` that runs create, release, and refund against testnet.

**Done when:** the smoke script proves release works, and refund fails before the deadline and succeeds after it.

**Gotchas:** trustline before receiving an asset (`op_no_trust`). Each entry locks a 0.5 XLM reserve. Amounts are strings with at most 7 decimals. Time predicates are unix seconds as strings.

## Phase 2: Auth and vendor onboarding (~75 min)

- [ ] Pages: `/signup`, `/login`, `/dashboard` (protected).
- [ ] Signup form: business name, email, password, WhatsApp number (optional), Instagram handle (optional).
- [ ] On signup, the server creates the vendor's custodial Stellar account (Phase 1) and stores it on the user.
- [ ] Session cookie, logout, and middleware that protects `/dashboard/*`.
- [ ] Dashboard shell: sidebar with Products, Orders, Balance.
- [ ] Show an **NGN balance** on the dashboard, read from Horizon.

**Done when:** you can sign up a brand-new vendor on the deployed site and see a ₦0 balance. The vendor's Stellar account exists on testnet.

## Phase 3: Products and shareable links (~90 min)

- [ ] `/dashboard/products/new`: name, description, price (₦), delivery window (24h, 48h, 72h, 7 days), photo upload (Vercel Blob, or an image URL field if short on time).
- [ ] Generates a short `slug` (6-8 characters). Public link: `https://<domain>/p/<slug>`.
- [ ] Products list with **Copy link** and **Share to WhatsApp** (`https://wa.me/?text=...`) buttons.
- [ ] Public product page `/p/[slug]`: a mobile-first card with photo, name, price, the vendor's business name, delivery window, and a prominent **Pay ₦X securely** button. Add a one-line explainer: "Your money is held until you confirm delivery."
- [ ] **Open Graph and Twitter meta tags** on that page (`generateMetadata`), so WhatsApp and Instagram show a rich preview. Test it by pasting the deployed link into a real WhatsApp chat.

**Done when:** a vendor creates a product and pastes the link into WhatsApp. The preview renders with the image and price. The public page works on a phone with no login.

## Phase 4: Buyer checkout and the simulated naira payment (~90 min)

- [ ] `/p/[slug]/checkout`: buyer name, phone, optional email, delivery address. No account, no password.
- [ ] `POST /api/orders`: creates the Order (status `PENDING_PAYMENT`), creates the buyer's **ephemeral custodial account** (funded by the treasury), generates the 6-digit code, and stores only its **SHA-256 hash**. Redirects to `/o/[token]`.
- [ ] `/o/[token]`: the **payment screen**:
  - Shows a fake virtual account number and the amount, labelled **TEST MODE: simulated bank transfer**.
  - A **"Simulate transfer received"** button that calls `POST /api/webhooks/bank` with a signed header (`BANK_WEBHOOK_SECRET`). In production this is where an anchor or PSP webhook plugs in.
- [ ] The webhook handler: mint test NGN to the buyer account, then call `escrow.create` with the deadline (now + the product's window). Save the balance ID and tx hash. Set status `SECURED`.
- [ ] Order page after payment: **"Payment secured. Your release code is 483920."** Show the code with a note: "Give this code to the seller only when you've received your item." Show the countdown to the refund deadline.

**Done when:** a buyer, in an incognito phone browser, goes from the link to a "Payment secured" page with a release code. Horizon shows a claimable balance with two claimants.

## Phase 5: Fulfilment loop (~90 min)

- [ ] Vendor `/dashboard/orders`: a table with status chips. A `SECURED` order shows a highlighted **"Payment secured, ship now"** with the buyer's name, phone, and address. Button: **Mark as shipped** (status `SHIPPED`).
- [ ] Vendor order detail: a **"Enter release code"** input. `POST /api/orders/:id/release` hashes the entered code, and on a match calls `escrow.release` and sets `RELEASED`. A wrong code returns an error and increments an attempts counter (lock after 5).
- [ ] **Refund:** the buyer's order page shows **Claim refund** once the deadline passes with the status still `SECURED` or `SHIPPED`. It calls `escrow.refund`. (A cron job to do this automatically is a stretch item.)
- [ ] **Dispute:** the buyer can press **Report a problem** before the deadline, which sets `DISPUTED` and freezes the release path in the app.
- [ ] `/admin` (a hard-coded admin email): a list of disputed orders with **Release to vendor** or **Refund buyer**. The `ESCROW` account acts as arbiter.
- [ ] **Chain receipt panel** on both the buyer and vendor order pages: a collapsed "Receipt on the chain" section with the transaction hashes as links to the Stellar Expert testnet explorer, plus the escrow status.

**Done when:** all three outcomes work end to end on the deployed app: release with the right code, refund after the deadline (use a 2-minute window in a test product), and an admin-resolved dispute.

## Phase 6: Vendor money screen and trust numbers (~45 min)

- [ ] Dashboard home: **Available balance** (₦, from Horizon), **In escrow** (the sum of `SECURED` and `SHIPPED` orders), **Completed orders**, **Disputed orders**.
- [ ] A **Withdraw to bank** button that opens a modal: "Payouts launch with our banking partner." It is clearly marked as not built. Don't fake a successful payout.
- [ ] A simple **completion rate** (`RELEASED` / all finished orders), shown on the public product page as "Seller: 96% completed, 24 orders". The score reads from the DB for now.

**Done when:** after a few test orders, the balance, escrow total, and trust numbers match reality.

---

## Acceptance test (run this at the end of the day)

On the **deployed URL**, with a person who hasn't seen the app:

1. Sign up as a new vendor.
2. Create a product at ₦15,000 with a photo.
3. Paste the link into WhatsApp and check the preview.
4. On a second device in a private tab, open the link and complete checkout.
5. Click "Simulate transfer received" and get the release code.
6. As the vendor, see "Payment secured", mark shipped, and enter the code.
7. Confirm the vendor balance rose by ₦15,000 and the order shows `RELEASED`.
8. Repeat with a 2-minute window and claim the refund.

If steps 1-7 pass, today succeeded.

## Cut lines (if time runs short, cut in this order)

1. Photo upload: use an image URL field.
2. The Phase 6 trust percentage: show raw counts only.
3. The dispute and admin page: keep the button and a "Under review" state, resolve manually by script.
4. The shipped status.

**Never cut:** signup, product link with preview, the payment, the escrow, the code release, and the refund.

## Honest limits (say these out loud in the pitch)

- Naira payment is simulated. A licensed anchor or PSP replaces the webhook.
- Accounts are custodial: the server holds the keys. This is a demo choice, and the plan is passkey smart accounts.
- The escrow is a service-held claimable balance. A Soroban contract replaces it, and the `EscrowService` interface is what makes that a swap and not a rewrite.
- The code, not a courier, proves delivery. A buyer who withholds it waits for the deadline, which auto-release will fix.

## Next (Nov 19+)

Crypto payment (USDC) with `pathPaymentStrictReceive`, vendor settlement currency, fee-bump transactions, auto-release with delivery proof, an embeddable trust badge, a scheduled job for refunds, the Soroban escrow, and passkey checkout.

## Suggested split if a second person joins

- **Person A:** Phases 1, 4, 5 (Stellar and the order state machine).
- **Person B:** Phases 2, 3, 6 (auth, products, dashboard, public pages).
Agree on the `EscrowService` interface and the Prisma schema in the first 30 minutes.
