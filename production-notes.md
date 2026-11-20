# Production Notes & Test-Development Findings

Operational findings, edge cases, and production-hardening requirements surfaced while building and testing **Escrow Pay Links** (Phases 0–4).

---

## 1. Paystack Checkout & Buyer Identity

- **Strict Email Domain Validation:** Paystack's `/transaction/initialize` rejects synthetic `.test` domains (`"email" must be a valid email`). Requiring a valid `buyerEmail` at checkout (while keeping **zero signup / no password**) ensures buyers receive official Paystack receipts, allows `/o/[token]` recovery if they close WhatsApp's in-app browser, and enables future buyer account linking.
- **Structured Nigerian Delivery Addresses:** Freeform textareas lead to incomplete courier addresses. Collect `street`, `city`, `state` (36 states + FCT), and optional `landmark` / delivery notes, formatted into `Order.buyerAddress`.
- **Dual Idempotent Confirmation:** Local dev works without ngrok because Paystack redirects to `/o/[token]?verify=1` (triggering `POST /api/orders/[token]/verify-paystack`). In production, also configure `POST /api/webhooks/paystack` in the Paystack Dashboard (`x-paystack-signature` HMAC-SHA512). Both paths share `confirmOrderPayment()`'s atomic `PENDING_PAYMENT -> PROCESSING_PAYMENT` guard.

---

## 2. Naira ↔ Stellar Settlement Timing & Currency Risk

- **Pay-In (`₦` → Escrow):**
  - *Pre-funded platform float (recommended):* **~5–30s total.** Paystack confirms Naira receipt, the backend immediately locks escrow from a pre-funded Stellar liquidity pool (`~5s` ledger close), and Naira ↔ stablecoin rebalancing happens asynchronously with an anchor/OTC partner.
  - *Per-order anchor on-ramp:* **1–5 minutes** waiting for NIP confirmation + anchor minting.
- **Release (`ESCROW` → Seller):** **~5 seconds** (1 Stellar ledger close).
- **Seller Bank Payout (`Withdraw to Bank`):** **~10s–2m** via NIBSS NIP (Paystack Transfers or licensed payout partner).
- **FX Drift Warning:** Holding escrow in **USDC** across 24h–7d delivery windows exposes the platform to NGN/USD rate movement. Production should use a **Naira-pegged asset** (e.g., cNGN / anchor NGN) or hedge open escrow exposure.

---

## 3. Secure, Low-Friction Buyer Refunds in Production

- **Card Payments:** Call Paystack `POST /refund` to reverse directly to the original card (3–7 business days via card networks; zero extra buyer input).
- **Bank Transfer / USSD Payments:** Collect **Bank + 10-digit Account Number** only when a buyer actually claims a refund on `/o/[token]`, behind 3 security gates:
  1. **Email / WhatsApp OTP:** Verify a 6-digit OTP sent to `order.buyerEmail` before accepting bank details so a leaked `/o/[token]` link cannot redirect funds.
  2. **BVN Name-Match Validation (`GET /bank/resolve`):** Resolve the destination account's registered name and verify it matches `order.buyerName` before payout (route mismatches to manual admin review).
  3. **Atomic State + Idempotent Reference:** Execute `escrowService.refund()` on-chain, transition `Order` to `REFUNDED`, and send `POST /transfer` with deterministic `reference: refund_${order.id}`.

---

## 4. Product Images (Instagram / WhatsApp Reality)

- **Do not rely on scraping Instagram URLs:** Instagram blocks datacenter IPs (Vercel/AWS) with login walls, issues short-lived signed `cdninstagram.com` URLs (`oe=...`) that expire, and sets `Cross-Origin-Resource-Policy: same-origin` headers that break `<img>` embeds and WhatsApp OG crawlers. Official `instagram_oembed` requires Meta App Review and still returns temporary CDN links.
- **Recommended Production Path:** Replace or supplement the Image URL input with **direct camera-roll upload** into **Neon Object Storage** (S3-compatible) or **Vercel Blob** so every product link has a permanent, fast, OG-compatible image URL.

---

## 5. Stellar Concurrency & Fee Reliability

- **`TREASURY` Sequence-Number Collisions:** Discovered during `scripts/smoke-escrow.ts` — parallel `createPrivyStellarAccount()` calls sharing `TREASURY` as the transaction source collide on Horizon sequence numbers (`tx_bad_seq` / `504` timeout).
  - *Production fix:* Serialize `TREASURY`-sourced transactions through a lightweight queue/mutex or maintain a pool of pre-funded sponsor accounts, and handle Horizon `504` responses by polling `extras.hash` before retrying.
- **Base Fee Headroom:** Using `1000` stroops (`0.0001 XLM`) instead of `200` stroops avoids drops during Testnet/Mainnet fee spikes.
- **Studio Photo Cropping:** Use `object-contain` on buyer product cards (`4:3`) so tall Instagram/skincare product shots aren't clipped.

---

## 6. Privy Tier 2 (`raw_sign`) Operational Notes

- **Dashboard Visibility:** Server wallets created with `POST /v1/wallets` (`chain_type: "stellar"`, `owner_id: null`) do **not** appear under Privy **Users**, and Tier 2 `raw_sign` hash signatures do **not** populate Privy's EVM/Solana transaction log UI. Verify balances and transactions via Stellar Horizon / Stellar Expert (`Receipt on the chain` drawer).

---

## 7. Next.js 16, Prisma 7 & Neon Postgres

- **Next.js 16 `cacheComponents: true`:** Any Server Component page or layout calling `auth.getSession()` (`cookies()`) or dynamic `params` without a `<Suspense>` boundary needs `export const instant = false` so `next build` doesn't fail prerender validation.
- **Prisma 7 + Neon:** `prisma.config.ts` must point migrations to unpooled `DATABASE_URL_UNPOOLED`, while runtime uses pooled `DATABASE_URL` via `@prisma/adapter-pg`. Normalize `sslmode=require` → `sslmode=verify-full` in `src/lib/prisma.ts` to prevent `pg-connection-string` deprecation warnings in Next.js Dev Overlay.
