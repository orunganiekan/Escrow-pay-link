import { afterEach, describe, expect, it, vi } from "vitest";
import { onRequestError } from "@/instrumentation";
import { log } from "@/server/log";

afterEach(() => vi.restoreAllMocks());

describe("structured logger", () => {
  it("writes one JSON line and redacts PII keys", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    log.error("order.refund.failed", { orderId: "ord_1", buyerEmail: "a@b.co", otp: "123456" }, new Error("boom"));

    const entry = JSON.parse(spy.mock.calls[0][0] as string);
    expect(entry).toMatchObject({
      level: "error",
      msg: "order.refund.failed",
      orderId: "ord_1",
      buyerEmail: "[redacted]",
      otp: "[redacted]",
      err: { name: "Error", message: "boom" },
    });
  });
});

describe("onRequestError", () => {
  it("logs unhandled errors without the order token", async () => {
    process.env.NEXT_RUNTIME = "nodejs";
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const token = "a1b2c3d4e5f60718293a4b5c6d7e8f90";

    await onRequestError(
      new Error("db down"),
      { path: `/o/${token}?verify=1`, method: "GET", headers: {} },
      {
        routerKind: "App Router",
        routePath: "/o/[token]",
        routeType: "render",
        renderSource: "server-rendering",
        revalidateReason: undefined,
      }
    );

    const line = spy.mock.calls[0][0] as string;
    expect(line).not.toContain(token);
    expect(JSON.parse(line)).toMatchObject({
      msg: "request.unhandled_error",
      path: "/o/[token]?verify=1",
      routePath: "/o/[token]",
      err: { message: "db down" },
    });
  });
});
