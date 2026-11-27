import crypto from "node:crypto";
import { describe, expect, it } from "vitest";
import { POST as webhook } from "@/app/api/webhooks/paystack/route";
import { confirmOrderPayment } from "@/server/orders/confirm";
import { seedOrder, seedProduct } from "../helpers/fake-db";
import { jsonRequest } from "../helpers/http";
import { state } from "../helpers/state";

function signed(payload: unknown) {
  const body = JSON.stringify(payload);
  const sig = crypto.createHmac("sha512", "sk_test_vitest").update(body).digest("hex");
  return jsonRequest("http://test/api/webhooks/paystack", body, { "x-paystack-signature": sig });
}

const chargeSuccess = (overrides: Record<string, unknown> = {}) => ({
  event: "charge.success",
  data: { reference: "epl_ref_1", amount: 1_500_000, currency: "NGN", status: "success", ...overrides },
});

function seedPending() {
  seedProduct(state.db);
  return seedOrder(state.db, {
    status: "PENDING_PAYMENT",
    claimableBalanceId: null,
    deadline: null,
  });
}

describe("POST /api/webhooks/paystack", () => {
  it("rejects a missing or forged signature", async () => {
    seedPending();
    const unsigned = await webhook(jsonRequest("http://test", chargeSuccess()));
    expect(unsigned.status).toBe(401);

    const forged = await webhook(
      jsonRequest("http://test", chargeSuccess(), { "x-paystack-signature": "ab".repeat(64) })
    );
    expect(forged.status).toBe(401);
    expect(state.escrow.mintAndCreate).not.toHaveBeenCalled();
  });

  it("rejects a body that was changed after signing", async () => {
    seedPending();
    const original = signed(chargeSuccess());
    const sig = original.headers.get("x-paystack-signature")!;
    const tampered = jsonRequest("http://test", chargeSuccess({ amount: 100 }), {
      "x-paystack-signature": sig,
    });
    expect((await webhook(tampered)).status).toBe(401);
  });

  it("ignores non charge.success events and unknown references", async () => {
    seedPending();
    const other = await webhook(signed({ event: "transfer.success", data: { reference: "epl_ref_1" } }));
    expect(await other.json()).toEqual({ received: true });

    const unknown = await webhook(signed(chargeSuccess({ reference: "epl_nope" })));
    expect(await unknown.json()).toEqual({ received: true });
    expect(state.escrow.mintAndCreate).not.toHaveBeenCalled();
  });

  it("rejects an amount or currency mismatch without escrowing", async () => {
    seedPending();
    expect((await webhook(signed(chargeSuccess({ amount: 1_499_999 })))).status).toBe(400);
    expect((await webhook(signed(chargeSuccess({ currency: "USD" })))).status).toBe(400);
    expect(state.escrow.mintAndCreate).not.toHaveBeenCalled();
    expect(state.db.orders.get("ord_1")!.status).toBe("PENDING_PAYMENT");
  });

  it("secures the order and sets the deadline from the product window", async () => {
    seedPending();
    const before = Date.now();
    const res = await webhook(signed(chargeSuccess()));
    expect(await res.json()).toEqual({ ok: true, status: "SECURED" });

    const order = state.db.orders.get("ord_1")!;
    expect(order.status).toBe("SECURED");
    expect(order.claimableBalanceId).toBe("cb_new");
    expect(order.txCreate).toBe("tx_create");
    const windowMs = 24 * 60 * 60 * 1000;
    expect(order.deadline!.getTime()).toBeGreaterThanOrEqual(before + windowMs);
    expect(order.deadline!.getTime()).toBeLessThanOrEqual(Date.now() + windowMs);
  });

  it("is idempotent across webhook redeliveries", async () => {
    seedPending();
    await webhook(signed(chargeSuccess()));
    const second = await webhook(signed(chargeSuccess()));
    expect(await second.json()).toEqual({ ok: true, status: "SECURED" });
    expect(state.escrow.mintAndCreate).toHaveBeenCalledTimes(1);
  });
});

describe("confirmOrderPayment", () => {
  it("escrows exactly once when webhook and redirect callback race", async () => {
    seedPending();
    let resolveMint!: (v: unknown) => void;
    state.escrow.mintAndCreate.mockImplementation(
      () => new Promise((r) => (resolveMint = r))
    );

    const first = confirmOrderPayment("ord_1");
    const second = await confirmOrderPayment("ord_1");
    expect(second).toEqual({ status: "PROCESSING_PAYMENT", alreadyProcessed: true });

    await new Promise((r) => setImmediate(r));
    resolveMint({ claimableBalanceId: "cb_new", txHash: "tx_create" });
    expect(await first).toEqual({ status: "SECURED", alreadyProcessed: false });
    expect(state.escrow.mintAndCreate).toHaveBeenCalledTimes(1);
  });

  it("rolls back to PENDING_PAYMENT when escrow fails so a retry can succeed", async () => {
    seedPending();
    state.escrow.mintAndCreate.mockRejectedValueOnce(new Error("horizon timeout"));
    await expect(confirmOrderPayment("ord_1")).rejects.toThrow("horizon timeout");
    expect(state.db.orders.get("ord_1")!.status).toBe("PENDING_PAYMENT");

    expect(await confirmOrderPayment("ord_1")).toEqual({ status: "SECURED", alreadyProcessed: false });
  });
});
