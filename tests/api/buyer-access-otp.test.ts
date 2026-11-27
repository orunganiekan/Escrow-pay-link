import { describe, expect, it, vi } from "vitest";
import type { NextResponse } from "next/server";
import { POST as requestOtp } from "@/app/api/orders/[token]/access/request-otp/route";
import { POST as verifyOtp } from "@/app/api/orders/[token]/access/verify-otp/route";
import { hasBuyerOrderAccess } from "@/server/orders/buyer-access";
import { seedOrder, seedProduct } from "../helpers/fake-db";
import { jsonRequest, params } from "../helpers/http";
import { state } from "../helpers/state";

const sentOtps: string[] = [];
vi.mock("@/server/email", () => ({
  sendBuyerOtpEmail: vi.fn(async ({ otp }: { otp: string }) => {
    sentOtps.push(otp);
    return { ok: true, mode: "dev-console" };
  }),
}));

function seed() {
  sentOtps.length = 0;
  seedProduct(state.db);
  return seedOrder(state.db);
}

async function request(token: string) {
  const res = (await requestOtp(new Request("http://test", { method: "POST" }), params({ token }))) as NextResponse;
  state.jar.absorb(res);
  return res;
}

async function verify(token: string, code: string) {
  const res = (await verifyOtp(jsonRequest("http://test", { code }), params({ token }))) as NextResponse;
  state.jar.absorb(res);
  return res;
}

describe("buyer email OTP step-up", () => {
  it("unlocks a new browser with the emailed code", async () => {
    const order = seed();
    const res = await request(order.token);
    expect(await res.json()).toMatchObject({ ok: true, maskedEmail: "ad***@e***e.com" });
    expect(sentOtps).toHaveLength(1);

    expect(await hasBuyerOrderAccess(order)).toBe(false);
    expect((await verify(order.token, sentOtps[0])).status).toBe(200);
    expect(await hasBuyerOrderAccess(order)).toBe(true);
  });

  it("enforces the resend cooldown", async () => {
    const order = seed();
    await request(order.token);
    const again = await request(order.token);
    expect(again.status).toBe(429);
    expect((await again.json()).retryAfterSeconds).toBeGreaterThan(0);
    expect(sentOtps).toHaveLength(1);
  });

  it("locks the challenge after five wrong codes", async () => {
    const order = seed();
    await request(order.token);
    const wrong = sentOtps[0] === "000000" ? "111111" : "000000";

    for (let i = 0; i < 4; i++) expect((await verify(order.token, wrong)).status).toBe(400);
    expect((await verify(order.token, wrong)).status).toBe(423);

    // Even the right code no longer works once the challenge is burned.
    expect((await verify(order.token, sentOtps[0])).status).toBe(400);
    expect(await hasBuyerOrderAccess(order)).toBe(false);
  });

  it("expires codes after ten minutes", async () => {
    const order = seed();
    vi.useFakeTimers({ toFake: ["Date"] });
    try {
      await request(order.token);
      vi.setSystemTime(Date.now() + 10 * 60 * 1000 + 1);
      expect((await verify(order.token, sentOtps[0])).status).toBe(400);
    } finally {
      vi.useRealTimers();
    }
  });

  it("returns 503 when email delivery is unavailable", async () => {
    const order = seed();
    const { sendBuyerOtpEmail } = await import("@/server/email");
    vi.mocked(sendBuyerOtpEmail).mockResolvedValueOnce({ ok: false, error: "not configured" });
    expect((await request(order.token)).status).toBe(503);
  });
});
