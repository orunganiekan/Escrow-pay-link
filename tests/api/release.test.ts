import { describe, expect, it } from "vitest";
import { POST as release } from "@/app/api/vendor/orders/[id]/release/route";
import { RELEASE_CODE, seedOrder, seedProduct } from "../helpers/fake-db";
import { jsonRequest, params } from "../helpers/http";
import { state } from "../helpers/state";

const submit = (code: string, id = "ord_1") =>
  release(jsonRequest("http://test", { code }), params({ id }));

describe("POST /api/vendor/orders/[id]/release", () => {
  it("requires an authenticated vendor", async () => {
    state.vendor.mockResolvedValue(null);
    expect((await submit(RELEASE_CODE)).status).toBe(401);
  });

  it("hides orders that belong to another vendor", async () => {
    seedProduct(state.db, { vendorId: "vendor_other" });
    seedOrder(state.db);
    expect((await submit(RELEASE_CODE)).status).toBe(404);
    expect(state.escrow.release).not.toHaveBeenCalled();
  });

  it("validates the code format before counting an attempt", async () => {
    seedProduct(state.db);
    seedOrder(state.db);
    expect((await submit("12ab")).status).toBe(400);
    expect(state.db.orders.get("ord_1")!.releaseAttempts).toBe(0);
  });

  it("releases funds with the correct code", async () => {
    seedProduct(state.db);
    seedOrder(state.db);
    const res = await submit(RELEASE_CODE);
    expect(await res.json()).toEqual({ ok: true, status: "RELEASED", txRelease: "tx_release" });
    expect(state.escrow.release).toHaveBeenCalledWith({
      claimableBalanceId: "cb_1",
      vendorPublicKey: "GVENDOR",
      amountNgn: "15000",
    });
    const order = state.db.orders.get("ord_1")!;
    expect(order.status).toBe("RELEASED");
    expect(order.resolvedAt).toBeInstanceOf(Date);
  });

  it("counts down wrong attempts and locks after five", async () => {
    seedProduct(state.db);
    seedOrder(state.db);

    for (let remaining = 4; remaining >= 1; remaining--) {
      const res = await submit("000000");
      expect(res.status).toBe(400);
      expect((await res.json()).attemptsRemaining).toBe(remaining);
    }
    const fifth = await submit("000000");
    expect(await fifth.json()).toMatchObject({ attemptsRemaining: 0 });

    const locked = await submit(RELEASE_CODE);
    expect(locked.status).toBe(423);
    expect(state.escrow.release).not.toHaveBeenCalled();
    expect(state.db.orders.get("ord_1")!.status).toBe("SECURED");
  });

  it("refuses release while disputed", async () => {
    seedProduct(state.db);
    seedOrder(state.db, { status: "DISPUTED" });
    const res = await submit(RELEASE_CODE);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/disputed/);
  });

  it("refuses release after the delivery window has expired", async () => {
    seedProduct(state.db);
    seedOrder(state.db, { deadline: new Date(Date.now() - 1000) });
    const res = await submit(RELEASE_CODE);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/expired/);
    expect(state.escrow.release).not.toHaveBeenCalled();
  });

  it("leaves the order releasable when the chain call fails", async () => {
    seedProduct(state.db);
    seedOrder(state.db);
    state.escrow.release.mockRejectedValueOnce(new Error("tx_bad_seq"));
    expect((await submit(RELEASE_CODE)).status).toBe(502);
    expect(state.db.orders.get("ord_1")!.status).toBe("SECURED");
  });
});
