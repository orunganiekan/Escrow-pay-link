import { beforeEach, vi } from "vitest";

// Deterministic test secrets — never real credentials.
process.env.ENCRYPTION_KEY = "a".repeat(64);
process.env.PAYSTACK_SECRET_KEY = "sk_test_vitest";
process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
process.env.LOG_LEVEL = "error";
process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/test";

// External systems (Postgres, Stellar/Privy, Paystack, Neon Auth) are
// replaced with in-memory doubles so the suite runs offline in CI.
vi.mock("@/lib/prisma", async () => ({ prisma: (await import("./helpers/state")).state.db }));

vi.mock("next/headers", async () => {
  const { state } = await import("./helpers/state");
  return { cookies: async () => state.jar, headers: async () => new Headers() };
});

vi.mock("@/server/stellar/escrow", async () => ({
  escrowService: (await import("./helpers/state")).state.escrow,
}));

vi.mock("@/server/stellar/accounts", async () => ({
  createPrivyStellarAccount: (await import("./helpers/state")).state.createPrivyStellarAccount,
}));

vi.mock("@/lib/vendor", async () => ({
  getAuthenticatedVendor: (await import("./helpers/state")).state.vendor,
}));

vi.mock("@/server/paystack", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/server/paystack")>();
  const { state } = await import("./helpers/state");
  return { ...actual, initializePaystackTransaction: state.initializePaystackTransaction };
});

beforeEach(async () => {
  (await import("./helpers/state")).resetState();
});
