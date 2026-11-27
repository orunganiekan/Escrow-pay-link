import { NextResponse } from "next/server";
import { describe, expect, it } from "vitest";
import { POST as dispute } from "@/app/api/orders/[token]/dispute/route";
import { POST as refund } from "@/app/api/orders/[token]/refund/route";
import { issueBuyerAccessCookie } from "@/server/orders/buyer-access";
import { seedOrder, seedProduct, type FakeOrder } from "../helpers/fake-db";
import { jsonRequest, params } from "../helpers/http";
import { state } from "../helpers/state";

const HOUR = 60 * 60 * 1000;

function seed(overrides: Partial<FakeOrder> = {}, { withAccess = true } = {}) {
  seedProduct(state.db);
  const order = seedOrder(state.db, overrides);
  if (withAccess) {
    const res = NextResponse.json({});
    issueBuyerAccessCookie(res, order);
    state.jar.absorb(res);
  }
  return order;
}

const fileDispute = (token: string, reason = "Item never arrived at my address") =>
  dispute(jsonRequest("http://test", { reason }), params({ token }));
const claimRefund = (token: string) => refund(new Request("http://test", { method: "POST" }), params({ token }));

describe("POST /api/orders/[token]/dispute", () => {
  it("requires the device-bound buyer cookie", async () => {
    const order = seed({}, { withAccess: false });
    expect((await fileDispute(order.token)).status).toBe(403);
    expect(state.db.orders.get(order.id)!.status).toBe("SECURED");
  });

  it("rejects a cookie minted for a different order", async () => {
    const order = seed({}, { withAccess: false });
    const res = NextResponse.json({});
    issueBuyerAccessCookie(res, { id: "ord_other", token: order.token });
    state.jar.absorb(res);
    expect((await fileDispute(order.token)).status).toBe(403);
  });

  it("freezes an active order with the buyer's reason", async () => {
    const order = seed({ status: "SHIPPED" });
    const res = await fileDispute(order.token);
    expect(await res.json()).toEqual({ ok: true, status: "DISPUTED" });
    const saved = state.db.orders.get(order.id)!;
    expect(saved.status).toBe("DISPUTED");
    expect(saved.disputeReason).toBe("Item never arrived at my address");
    expect(saved.disputedAt).toBeInstanceOf(Date);
  });

  it("validates the reason length", async () => {
    const order = seed();
    expect((await fileDispute(order.token, "bad")).status).toBe(400);
  });

  it("points the buyer to a refund once the window has expired", async () => {
    const order = seed({ deadline: new Date(Date.now() - HOUR) });
    const res = await fileDispute(order.token);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/refund/);
  });

  it("rejects disputes on settled orders", async () => {
    const order = seed({ status: "RELEASED" });
    expect((await fileDispute(order.token)).status).toBe(400);
  });
});

describe("POST /api/orders/[token]/refund", () => {
  it("requires the device-bound buyer cookie", async () => {
    const order = seed({ deadline: new Date(Date.now() - HOUR) }, { withAccess: false });
    expect((await claimRefund(order.token)).status).toBe(403);
    expect(state.escrow.refund).not.toHaveBeenCalled();
  });

  it("is unavailable before the delivery window expires", async () => {
    const order = seed();
    const res = await claimRefund(order.token);
    expect(res.status).toBe(400);
    expect(state.escrow.refund).not.toHaveBeenCalled();
  });

  it.each(["SECURED", "SHIPPED", "DISPUTED"] as const)(
    "refunds a %s order after the deadline",
    async (status) => {
      const order = seed({ status, deadline: new Date(Date.now() - HOUR) });
      const res = await claimRefund(order.token);
      expect(await res.json()).toEqual({ ok: true, status: "REFUNDED", txRefund: "tx_refund" });
      expect(state.escrow.refund).toHaveBeenCalledWith({
        claimableBalanceId: "cb_1",
        buyerPublicKey: "GBUYER",
        buyerPrivyWalletId: "privy_buyer_1",
      });
      expect(state.db.orders.get(order.id)!.status).toBe("REFUNDED");
    }
  );

  it("cannot refund an order twice", async () => {
    const order = seed({ deadline: new Date(Date.now() - HOUR) });
    await claimRefund(order.token);
    expect((await claimRefund(order.token)).status).toBe(400);
    expect(state.escrow.refund).toHaveBeenCalledTimes(1);
  });

  it("returns 502 and keeps the order refundable when the chain call fails", async () => {
    const order = seed({ deadline: new Date(Date.now() - HOUR) });
    state.escrow.refund.mockRejectedValueOnce(new Error("horizon 504"));
    expect((await claimRefund(order.token)).status).toBe(502);
    expect(state.db.orders.get(order.id)!.status).toBe("SECURED");
  });
});
