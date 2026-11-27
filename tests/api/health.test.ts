import { afterEach, describe, expect, it, vi } from "vitest";
import { state } from "../helpers/state";

vi.mock("next/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/server")>()),
  connection: async () => {},
}));

const { GET } = await import("@/app/api/health/route");

describe("GET /api/health", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("reports 200 when Postgres and Horizon respond", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 200 })));
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({ ok: true, checks: { database: { ok: true }, horizon: { ok: true } } });
    expect(body).not.toHaveProperty("counts");
    expect(res.headers.get("cache-control")).toBe("no-store");
  });

  it("reports 503 when Horizon is down", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("", { status: 502 })));
    const res = await GET();
    expect(res.status).toBe(503);
    expect((await res.json()).checks.horizon.ok).toBe(false);
  });

  it("reports 503 when Postgres is unreachable", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 200 })));
    const spy = vi.spyOn(state.db, "$queryRaw").mockRejectedValueOnce(new Error("ECONNREFUSED"));
    const res = await GET();
    expect(res.status).toBe(503);
    expect((await res.json()).checks.database.ok).toBe(false);
    spy.mockRestore();
  });
});
