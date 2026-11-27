<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Escrow Pay Links

Naira (₦) social-commerce payment links backed by invisible Stellar escrow. See [`intent.md`](./intent.md) for core product intent, [`system-design.md`](./system-design.md) for implemented architecture, [`plan.md`](./plan.md) for build status & roadmap, [`production-notes.md`](./production-notes.md) for operational findings, and `.design/` for UI design:
- [`.design/design-spec.md`](./.design/design-spec.md) — screen-by-screen UX, routes, and all 7 `OrderStatus` states (read the YAML `lookup` header at lines 1–60 first to target only the relevant lines).
- [`.design/DESIGN.md`](./.design/DESIGN.md) — Warm Editorial design tokens, palette, and typography scales.

## Commands

- Dev / build / lint / types: `npm run dev`, `npm run build`, `npm run lint`, `npx tsc --noEmit`
- Tests: `npm test` (Vitest, offline API/unit), `npm run test:e2e` (Playwright; run `npm run build` first)
- Prisma: `npx prisma migrate dev`, `npx prisma generate`
- Stellar scripts: `npx tsx scripts/bootstrap.ts`, `npx tsx scripts/smoke-escrow.ts`

## Non-Obvious Constraints & Gotchas

- **Server-only Stellar & Privy:** Keep all `@stellar/stellar-sdk` and Privy signing logic strictly in `src/server/stellar/`. Never import it into Client Components.
- **Escrow interface:** Route all escrow lifecycle calls through `EscrowService` (`ClaimableBalanceEscrow` for now) so Soroban can replace it without rewriting callers.
- **No user private keys in Postgres:** Vendor and buyer Stellar keys live in Privy (`chain_type: "stellar"`, Tier 2 `raw_sign`); Postgres stores only `stellarPublic` and `privyWalletId`.
- **Zero-wallet UX:** Never show crypto/wallet/XLM terminology in buyer or vendor flows—only Naira, delivery windows, Paystack checkout, and the 6-digit release code (chain hashes stay inside the collapsed "Receipt on the chain" panel).
- **Neon Auth + `Vendor` split:** Auth lives in Neon's managed `neon_auth` schema (`@neon/auth`); vendor business profiles and Stellar IDs live in `public.Vendor` keyed by `authUserId`. Route protection lives in Next.js 16 `src/proxy.ts`, and dynamic/auth server pages declare `export const instant = false` (`cacheComponents: true`).
- **Neon URLs:** Use pooled `DATABASE_URL` at runtime (normalized to `sslmode=verify-full` in `src/lib/prisma.ts`) and unpooled `DATABASE_URL_UNPOOLED` (via `prisma.config.ts`) for `prisma migrate` / seeding (PgBouncer breaks migrations).
- **Order route namespace:** Buyer capability routes live under `/api/orders/[token]/...`; vendor fulfillment routes live under `/api/vendor/orders/[id]/...` to avoid Next.js App Router dynamic sibling `[token]` vs `[id]` conflicts.
- **Paystack idempotency & verification:** Always verify `x-paystack-signature` (HMAC-SHA512) against the raw request body, validate amount (kobo) + `NGN`, require a valid `buyerEmail`, and use an atomic `PENDING_PAYMENT -> PROCESSING_PAYMENT` update before running `mintAndCreate`.
- **Release codes & windows:** Store both `codeHash` (HMAC-SHA256, `timingSafeEqual`, lock at 5 attempts) and `codeEnc` (AES-256-GCM for buyer refresh). Store `Product.windowMinutes` in minutes (`2..43200`) to support 2-minute test windows and custom durations.
