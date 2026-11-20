# Escrow Pay Links

Naira (`₦`) social-commerce payment links for WhatsApp and Instagram sellers, backed by invisible Stellar escrow. Buyers pay in Naira with zero signup and receive a 6-digit release code; sellers ship with confidence and get paid as soon as delivery is confirmed.

## Stack

- **Framework:** Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- **Database & Auth:** Neon Postgres + Prisma 7 (`@prisma/adapter-pg`) + Neon Auth (`@neon/auth`)
- **Payments:** Paystack Test Mode (Bank Transfer, Card, USSD + HMAC-SHA512 webhooks)
- **Escrow & Custody:** Stellar Testnet (`@stellar/stellar-sdk` Claimable Balances behind `EscrowService`) + Privy Server Wallets (`chain_type: "stellar"`, Tier 2 `raw_sign`)

## Local Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Configure environment variables:**
   Copy `.env.example` to `.env.local` and fill in your Neon Postgres, Neon Auth, Privy, Paystack Test Mode, `ENCRYPTION_KEY`, and `ADMIN_EMAIL` values.
3. **Bootstrap Stellar Testnet platform accounts (once):**
   ```bash
   npx tsx scripts/bootstrap.ts
   ```
   Add the printed `TREASURY_SECRET`, `ISSUER_SECRET`, and `ESCROW_SECRET` to `.env.local`.
4. **Run database migrations & generate Prisma client:**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```
5. **Verify Stellar + Privy escrow lifecycle (optional):**
   ```bash
   npx tsx scripts/smoke-escrow.ts
   ```
6. **Start the dev server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Commands

- `npm run dev` / `npm run build` / `npm run lint` / `npx tsc --noEmit`
- `npx prisma migrate dev` / `npx prisma generate`
- `npx tsx scripts/bootstrap.ts` / `npx tsx scripts/smoke-escrow.ts`

## Documentation

- [`intent.md`](./intent.md) — Core product intent and principles
- [`system-design.md`](./system-design.md) — Architecture, Stellar/Privy layer, Paystack flow, data model, and API routes
- [`plan.md`](./plan.md) — Phased implementation status, acceptance test, and roadmap
- [`production-notes.md`](./production-notes.md) — Real-world test-dev findings and production-hardening notes
- [`.design/DESIGN.md`](./.design/DESIGN.md) — Warm Editorial Minimalism design tokens and typography
- [`.design/design-spec.md`](./.design/design-spec.md) — Screen-by-screen UX specification and `OrderStatus` states
