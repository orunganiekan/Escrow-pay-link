# Production Notes & Test-Development Findings

Operational findings, edge cases, hosting checklist, and production-hardening requirements surfaced while building and testing **Escrow Pay Links** (Phases 0–6).

---

## 1. Hosting Checklist (Vercel Testnet / Staging)

Before deploying to Vercel:
- **Serverless `maxDuration`:** Routes invoking Privy + Stellar Horizon (`POST /api/orders`, `POST /api/vendor/onboarding`, `POST /api/orders/[token]/verify-paystack`, `POST /api/webhooks/paystack`, release, refund, and admin resolve) can take 5–8 seconds per ledger close; export `export const maxDuration = 30` so slow ledgers don't hit Vercel's default 10s timeout.
- **Environment Variables:** Set all variables from `.env.example` in Vercel with `NEXT_PUBLIC_APP_URL="https://<your-vercel-domain>"` (including `RESEND_API_KEY` and `RESEND_FROM_EMAIL` for cross-device buyer OTP verification on `/o/[token]`).
- **Neon Auth Trusted Domain:** Add the deployed Vercel domain under **Neon Console → Auth → Trusted Domains**.
- **Paystack Webhook URL:** Configure `https://<your-vercel-domain>/api/webhooks/paystack` in **Paystack Dashboard → Settings → API Keys & Webhooks**.

---

## 2. Abuse & Treasury Drain Protection

- **Deferred Buyer Wallet Provisioning & Rate Limiting:** `POST /api/orders` is a public endpoint that currently provisions a Privy Stellar wallet funded with **`3 XLM` from `TREASURY`** *before* the buyer pays. In production:
  1. Defer `createPrivyStellarAccount()` until *after* Paystack confirms payment (`confirmOrderPayment`), so unpaid/abandoned checkouts never consume `TREASURY` XLM.
  2. Add rate limiting (IP + email throttling) across `POST /api/orders`, `POST /api/vendor/onboarding`, `POST /api/orders/[token]/dispute`, and auth endpoints.
- **HTTP Security Headers:** Configure `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, and `Referrer-Policy` in `next.config.ts`.

---

## 3. Paystack Checkout & Buyer Identity

- **Strict Email Domain Validation:** Paystack's `/transaction/initialize` rejects synthetic `.test` domains (`"email" must be a valid email`). Requiring a valid `buyerEmail` at checkout (while keeping **zero signup / no password**) ensures buyers receive official Paystack receipts, allows `/o/[token]` recovery if they close WhatsApp's in-app browser, and enables future buyer account linking.
- **Transactional Order Recovery Emails:** Send an automated confirmation email (via Resend) containing the buyer's `/o/[token]` link and order summary right after checkout/payment so buyers who close WhatsApp's in-app browser can always recover their release code.
- **Seller Auth Recovery:** Password reset & email-only sign-in via Resend SMTP (tracked in GitHub Issue #1).
- **Structured Nigerian Delivery Addresses:** Freeform textareas lead to incomplete courier addresses. Collect `street`, `city`, `state` (36 states + FCT), and optional `landmark` / delivery notes, formatted into `Order.buyerAddress`.
- **Dual Idempotent Confirmation:** Local dev works without ngrok because Paystack redirects to `/o/[token]?verify=1` (triggering `POST /api/orders/[token]/verify-paystack`). In production, also configure `POST /api/webhooks/paystack` in the Paystack Dashboard (`x-paystack-signature` HMAC-SHA512). Both paths share `confirmOrderPayment()`'s atomic `PENDING_PAYMENT -> PROCESSING_PAYMENT` guard.

---

## 4. Naira ↔ Stellar Settlement Timing & Currency Risk

- **Pay-In (`₦` → Escrow):**
  - *Pre-funded platform float (recommended):* **~5–30s total.** Paystack confirms Naira receipt, the backend immediately locks escrow from a pre-funded Stellar liquidity pool (`~5s` ledger close), and Naira ↔ stablecoin rebalancing happens asynchronously with an anchor/OTC partner.
  - *Per-order anchor on-ramp:* **1–5 minutes** waiting for NIP confirmation + anchor minting.
- **Release (`ESCROW` → Seller):** **~5 seconds** (1 Stellar ledger close).
- **Seller Bank Payout (`Withdraw to Bank`):** Replace the coming-soon modal with bank account linking (`GET /bank/resolve`) + NIBSS NIP payouts (**~10s–2m** via Paystack Transfers or licensed payout partner).
- **FX Drift Warning:** Holding escrow in **USDC** across 24h–7d delivery windows exposes the platform to NGN/USD rate movement. Production should use a **Naira-pegged asset** (e.g., cNGN / anchor NGN) or hedge open escrow exposure.

---

## 5. Secure, Low-Friction Buyer Refunds in Production

- **Card Payments:** Call Paystack `POST /refund` to reverse directly to the original card (3–7 business days via card networks; zero extra buyer input).
- **Bank Transfer / USSD Payments:** Collect **Bank + 10-digit Account Number** only when a buyer actually claims a refund on `/o/[token]`, behind 3 security gates:
  1. **Email / WhatsApp OTP:** Verify a 6-digit OTP sent to `order.buyerEmail` before accepting bank details so a leaked `/o/[token]` link cannot redirect funds.
  2. **BVN Name-Match Validation (`GET /bank/resolve`):** Resolve the destination account's registered name and verify it matches `order.buyerName` before payout (route mismatches to manual admin review).
  3. **Atomic State + Idempotent Reference:** Execute `escrowService.refund()` on-chain, transition `Order` to `REFUNDED`, and send `POST /transfer` with deterministic `reference: refund_${order.id}`.

---

## 6. Product Images (Cloudflare R2)

- **Do not rely on scraping Instagram URLs:** Instagram blocks datacenter IPs (Vercel/AWS) with login walls, issues short-lived signed `cdninstagram.com` URLs (`oe=...`) that expire, and sets `Cross-Origin-Resource-Policy: same-origin` headers that break `<img>` embeds and WhatsApp OG crawlers. Official `instagram_oembed` requires Meta App Review and still returns temporary CDN links.
- **Production Storage Path — Cloudflare R2 (`https://www.cloudflare.com/products/r2/`):** Replace or supplement the Image URL input with direct camera-roll uploads to **Cloudflare R2** (S3-compatible object storage with zero egress fees and a custom public CDN domain) via presigned upload URLs so every product link has a permanent, fast, WhatsApp OG-compatible image URL.
- **Studio Photo Cropping:** Keep `object-contain` on buyer product cards (`4:3`) so tall Instagram/skincare product shots aren't clipped.

---

## 7. Stellar Mainnet, Concurrency & Fee Reliability

- **Mainnet Migration:** Switch `src/server/stellar/config.ts` from Testnet/Friendbot to Mainnet with environment-driven network passphrase and Horizon URL.
- **`TREASURY` Sequence-Number Collisions:** Discovered during `scripts/smoke-escrow.ts` — parallel `createPrivyStellarAccount()` calls sharing `TREASURY` as the transaction source collide on Horizon sequence numbers (`tx_bad_seq` / `504` timeout).
  - *Production fix:* Serialize `TREASURY`-sourced transactions through a lightweight queue/mutex or maintain a pool of pre-funded sponsor accounts, add low-XLM balance alerts, and handle Horizon `504` responses by polling `extras.hash` before retrying.
- **Base Fee Headroom:** Using `1000` stroops (`0.0001 XLM`) instead of `200` stroops avoids drops during Testnet/Mainnet fee spikes.

---

## 8. Privy Tier 2 (`raw_sign`) Operational Notes

- **Dashboard Visibility:** Server wallets created with `POST /v1/wallets` (`chain_type: "stellar"`, `owner_id: null`) do **not** appear under Privy **Users**, and Tier 2 `raw_sign` hash signatures do **not** populate Privy's EVM/Solana transaction log UI. Verify balances and transactions via Stellar Horizon / Stellar Expert (`Receipt on the chain` drawer).

---

## 9. Next.js 16, Prisma 7, Observability & Compliance

- **Next.js 16 `cacheComponents: true`:** Any Server Component page or layout calling `auth.getSession()` (`cookies()`) or dynamic `params` without a `<Suspense>` boundary needs `export const instant = false` so `next build` doesn't fail prerender validation.
- **Prisma 7 + Neon:** `prisma.config.ts` must point migrations to unpooled `DATABASE_URL_UNPOOLED`, while runtime uses pooled `DATABASE_URL` via `@prisma/adapter-pg`. Normalize `sslmode=require` → `sslmode=verify-full` in `src/lib/prisma.ts` to prevent `pg-connection-string` deprecation warnings in Next.js Dev Overlay.
- **Observability (done, no Sentry):** Structured JSON logs (`src/server/log.ts`) and `onRequestError` in `src/instrumentation.ts` cover handled and uncaught server errors. To get alerts: add a Vercel log drain or alert on `"level":"error"`, and point an uptime monitor (Better Stack, UptimeRobot, Vercel Checks) at `GET /api/health`, alerting on non-200. A hosted error tracker can be added later behind `log.error` without touching call sites.
- **Automated Testing (done):** Vitest API/unit suite + Playwright E2E + GitHub Actions CI (see `system-design.md` §9). Not covered offline: real Stellar/Privy transactions (keep using `scripts/smoke-escrow.ts`) and Paystack's hosted page beyond the redirect.
- **Legal pages (drafted, pending counsel):** `/legal/terms`, `/legal/escrow`, `/legal/privacy` are live and linked from the footer, checkout and seller signup. Before real money: fill `entityName`, `rcNumber`, `registeredAddress`, `privacyEmail` and `fundsCustodian` in `src/lib/legal.ts`, have Nigerian counsel review the texts, then set `pendingLegalReview: false` to remove the draft banner.

## 10. Nigerian Fintech & Escrow Compliance Structure (open — business/legal decision)

Not solvable in code. Items to settle with Nigerian fintech counsel before taking real payments:

- **Who holds customer funds.** EscrowPay must not hold buyer money in its own account. Options, in rough order of time-to-launch:
  1. **Licensed PSP partner** whose product supports held/split settlement (collect into a PSP-managed balance; release or refund on our API instruction). Fastest, as the regulatory burden stays with the partner.
  2. **Trustee structure:** an SEC-registered trustee company holds funds in a designated trust account at a commercial bank under a trust deed that mirrors `/legal/escrow`.
  3. **Own CBN licence** (e.g. Payment Solution Service Provider). Slowest and most capital-intensive; only worth it at scale.
- **Corporate:** CAC incorporation; RC number on all legal pages; tax registration.
- **Data protection (NDPA 2023 / NDPC GAID):** appoint a DPO, register with the NDPC if we qualify as a data controller of major importance, keep a record of processing, sign DPAs with processors (Paystack, Neon, Vercel, Privy, email provider), document cross-border transfer safeguards, file annual compliance audit returns, and keep the 72-hour breach notification runbook.
- **AML/CFT:** confirm whether SCUML registration applies, define KYC tiers for sellers (BVN/NIN before payouts), transaction monitoring thresholds, and 5-year record retention (matches the Privacy Policy).
- **Consumer protection:** confirm the dispute process meets FCCPC expectations.
- **Settlement ledger disclosure:** the Privacy Policy and Escrow Agreement disclose the public settlement ledger in neutral terms; confirm counsel is comfortable with this wording under the zero-crypto-UX principle.
