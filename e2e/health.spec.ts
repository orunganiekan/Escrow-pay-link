import { expect, test } from "@playwright/test";

test("GET /api/health reports dependency checks without business data", async ({ request }) => {
  const res = await request.get("/api/health");
  // Offline runs have no database, so 503 is expected there; staging must be 200.
  const expectHealthy = !!process.env.E2E_BASE_URL;
  expect(res.status()).toBe(expectHealthy ? 200 : 503);
  expect(res.headers()["cache-control"]).toBe("no-store");

  const body = await res.json();
  expect(body).toMatchObject({
    ok: expectHealthy,
    checks: {
      database: { ok: expect.any(Boolean), latencyMs: expect.any(Number) },
      horizon: { ok: expect.any(Boolean), latencyMs: expect.any(Number) },
    },
  });
  expect(body).not.toHaveProperty("counts");
});
