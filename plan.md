# Escrow Pay Links: Product Build Plan

> **Status:** **Phases 0–6 Complete** (including Warm Editorial UI redesign, server-side pagination, error/loading boundaries, and segmented 6-digit release code input).  
> **Architecture Note:** During implementation, auth evolved to **Neon Auth (Managed Better Auth)**, key custody upgraded to **Privy Tier 2 Stellar Server Wallets** (zero user private keys in Postgres), and the Naira rail upgraded to **Paystack Test Mode** (real Bank Transfer / Card checkout + HMAC-SHA512 webhook + callback verification). See [`system-design.md`](./system-design.md) for the live architecture and [`production-notes.md`](./production-notes.md) for operational findings.

## The target

Working end-to-end on a **deployed URL**, with no terminal involved:

1. A vendor **signs up** with email and password and completes one-step store onboarding.
2. The vendor **creates a product** (name, photo URL, price in Naira, delivery window) and gets a **shareable link**.
3. The vendor pastes the link into a WhatsApp chat. It renders a **rich OG preview** (product name, price, photo).
4. A buyer opens the link on a phone, **pays in Naira** via Paystack, and never sees the word "wallet".
5. The vendor sees **"Payment secured, ship now"** on their dashboard.
6. On delivery the buyer gives a **6-digit release code**. The vendor enters it, and the money lands in the vendor's balance.
7. If the deadline passes with no release, the buyer claims a **full refund**.

Stellar Testnet runs underneath (Privy server wallets + Claimable Balance escrow). Users see none of it; verifiers can expand the **"Receipt on the chain"** drawer on any order.

---

## Phase 0: Scaffold and skeleton

- [x] Next.js 16 (TypeScript, App Router, Tailwind v4) with Prisma 7, `@stellar/stellar-sdk`, `@neon/auth`, `zod`.
- [x] Neon Postgres configured with pooled `DATABASE_URL` (runtime) and unpooled `DATABASE_URL_UNPOOLED` (`prisma.config.ts` migrations).
- [x] Schema migrated (`Vendor`, `Product`, `Order`, `OrderStatus`).
- [x] `.env.example` documenting all required environment variables.

## Phase 1: Stellar foundation & Privy server wallets

Everything Stellar & Privy lives strictly in `src/server/stellar/`. UI components never import from it.

- [x] `scripts/bootstrap.ts`: creates and funds `TREASURY`, `ISSUER`, and `ESCROW` on Testnet via Friendbot, issues test `NGN`, and adds `ESCROW`'s trustline.
- [x] `createPrivyStellarAccount()` (`src/server/stellar/privy.ts`, `accounts.ts`): creates a Privy Stellar Ed25519 wallet, funds it with `3 XLM` from `TREASURY`, and adds the `NGN` trustline in 1 atomic transaction.
- [x] `src/server/crypto.ts`: AES-256-GCM (`encrypt`/`decrypt`) and HMAC-SHA256 (`hashReleaseCode`/`verifyReleaseCode`) with `timingSafeEqual`.
- [x] `mintTestNgn()` and `EscrowService` (`ClaimableBalanceEscrow` with `create`, `mintAndCreate`, `release`, `refund`, `adminRefund`, `status`).
- [x] `scripts/smoke-escrow.ts`: verified live against Stellar Testnet + Privy (`ALL PHASE 1 CHECKS PASSED`).

## Phase 2: Auth and vendor onboarding

- [x] Pages: `/signup`, `/login`, `/onboarding`, `/dashboard` (protected via `src/proxy.ts`).
- [x] Neon Auth server/client helpers (`src/lib/auth/server.ts`, `src/lib/auth/client.ts`) and `/api/auth/[...path]`.
- [x] One-step `/onboarding` (`POST /api/vendor/onboarding`) provisions the vendor's Privy Stellar account and creates the `public.Vendor` row.
- [x] Responsive dashboard shell (`240px` desktop sidebar + mobile 4-tab bottom nav) with live Horizon `NGN` balance.

## Phase 3: Products and shareable links

- [x] `/dashboard/products/new`: Image URL + live `16:10` preview, name, description, price (`₦`), delivery window presets (`2m` test, `24h`, `48h`, `72h`, `7d`) + custom window (`2..43200` min).
- [x] Short unique `slug` for `/p/[slug]`, active/inactive toggle (`PATCH /api/products/[id]`).
- [x] Paginated Pay Links list (`/dashboard/products`) with **Copy link** and **Share to WhatsApp** buttons.
- [x] Public `/p/[slug]` with 2-column desktop gallery / mobile-first layout, earned seller completion rate, inline zero-signup checkout, and Open Graph / Twitter `generateMetadata()`.

## Phase 4: Buyer checkout and Paystack escrow funding

- [x] Inline checkout on `/p/[slug]` collecting name, phone, required valid email, and structured Nigerian delivery address (`street`, `city`, `state`, optional `landmark`).
- [x] `POST /api/orders`: creates `Order` (`PENDING_PAYMENT`), ephemeral buyer Privy Stellar wallet, 6-digit release code (`codeHash` + `codeEnc`), and Paystack checkout URL; redirects to `/o/[token]`.
- [x] Dual idempotent confirmation (`POST /api/webhooks/paystack` with HMAC-SHA512 signature verification + `POST /api/orders/[token]/verify-paystack` on `?verify=1` return) sharing atomic `PENDING_PAYMENT -> PROCESSING_PAYMENT` guard before `escrow.mintAndCreate()`.
- [x] `/o/[token]` unified receipt displaying the decrypted 6-digit release code and live delivery countdown.

## Phase 5: Fulfilment loop, disputes & admin arbitration

- [x] Server-paginated `/dashboard/orders` (search + status filters + `groupBy` counts) and `/dashboard/orders/[id]` detail view.
- [x] `POST /api/vendor/orders/[id]/ship` transitions `SECURED -> SHIPPED`.
- [x] `POST /api/vendor/orders/[id]/release` with segmented 6-digit input (`SixDigitCodeInput`), `timingSafeEqual` check, 5-attempt lock, and on-chain `escrow.release()`.
- [x] `POST /api/orders/[token]/refund` lets buyer claim on-chain refund once the delivery deadline expires.
- [x] `POST /api/orders/[token]/dispute` freezes payout before deadline; `/admin` (`POST /api/admin/orders/[id]/resolve`) gives admin equal-weight **Refund Buyer** / **Release to Seller** controls before deadline.
- [x] Collapsed **"Receipt on the chain"** drawer on buyer, vendor, and admin order pages linking to Stellar Expert Testnet.

## Phase 6: Vendor money screen, trust metrics & polish

- [x] `/dashboard` overview banner: live Horizon **Available balance**, DB-aggregated **In escrow** total, **Completed** & **Disputed** counts, and **Completion rate**.
- [x] **Withdraw to bank** modal honestly stating payouts launch with a banking partner.
- [x] Earned seller completion rate bar on `/p/[slug]`.
- [x] Editorial landing page (`/`), custom `not-found.tsx` / `error.tsx`, route `loading.tsx` skeletons, and branded `icon.svg`.

---

## End-to-End Acceptance Test

1. Sign up as a new vendor and complete store onboarding.
2. Create a product at `₦15,000` with a photo URL.
3. Paste the link into WhatsApp and verify the Open Graph preview.
4. In a private mobile tab, open `/p/[slug]`, fill delivery details, and pay via Paystack Test Mode.
5. Verify `/o/[token]` transitions to **Funds Locked in Escrow** with a 6-digit release code and live countdown.
6. As the vendor, mark shipped and enter the 6-digit release code.
7. Confirm vendor available balance rises by `₦15,000` and the order shows `RELEASED`.
8. Repeat with a **2-minute test window** and claim the post-deadline refund.

## Honest Limits

- **Test-mode Naira rail:** Paystack runs in Test Mode and test `NGN` is minted on Stellar Testnet; production requires live Paystack keys + a licensed NGN/cNGN Stellar anchor or pre-funded float.
- **Server-managed wallets:** Privy Server Wallets (`raw_sign`) keep private keys inside Privy's TEE rather than Postgres; passkey smart accounts are a future upgrade.
- **Claimable Balance escrow:** Implemented behind `EscrowService` so a Soroban smart contract can replace it without rewriting callers.
- **Code-based delivery proof:** The buyer's 6-digit code proves delivery; courier webhook auto-release is a future enhancement.

## Next Roadmap

- Password reset & email-only sign-in via Resend SMTP ([Issue #1](https://github.com/orunganiekan/Escrow-pay-link/issues/1)).
- Direct product image uploads via **Cloudflare R2** (see [`production-notes.md`](./production-notes.md)).
- Production Naira on-ramp/off-ramp (cNGN / licensed anchor + Paystack Transfers with OTP & BVN name-match refunds).
- Soroban escrow contract swap behind `EscrowService`, automated post-deadline refund cron, USDC `pathPaymentStrictReceive`, and embeddable seller trust badges.
