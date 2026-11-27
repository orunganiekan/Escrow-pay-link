import { vi } from "vitest";
import { createCookieJar } from "./cookie-jar";
import { createFakeDb, type FakeDb } from "./fake-db";

/**
 * Shared test doubles wired in by tests/setup.ts. Tests import these handles to
 * seed data, inspect writes, and script escrow / vendor-auth behaviour.
 */
export const state = {
  db: createFakeDb() as FakeDb,
  jar: createCookieJar(),
  escrow: {
    mintAndCreate: vi.fn(),
    release: vi.fn(),
    refund: vi.fn(),
    adminRefund: vi.fn(),
  },
  vendor: vi.fn(),
  createPrivyStellarAccount: vi.fn(),
  initializePaystackTransaction: vi.fn(),
};

export function resetState() {
  state.db.orders.clear();
  state.db.products.clear();
  state.jar.clear();
  for (const fn of Object.values(state.escrow)) fn.mockReset();
  state.vendor.mockReset();
  state.createPrivyStellarAccount.mockReset();
  state.initializePaystackTransaction.mockReset();

  state.escrow.mintAndCreate.mockResolvedValue({ claimableBalanceId: "cb_new", txHash: "tx_create" });
  state.escrow.release.mockResolvedValue({ txHash: "tx_release" });
  state.escrow.refund.mockResolvedValue({ txHash: "tx_refund" });
  state.vendor.mockResolvedValue({ id: "vendor_1", stellarPublic: "GVENDOR" });
  state.createPrivyStellarAccount.mockResolvedValue({
    publicKey: "GNEWBUYER",
    privyWalletId: "privy_new",
  });
  state.initializePaystackTransaction.mockImplementation(async (p: { reference: string }) => ({
    authorizationUrl: "https://checkout.paystack.com/test",
    reference: p.reference,
  }));
}
