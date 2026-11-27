import { connection, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { log } from "@/server/log";
import { HORIZON_URL } from "@/server/stellar/config";

const CHECK_TIMEOUT_MS = 3_000;

type CheckResult = { ok: boolean; latencyMs: number; error?: string };

async function timed(check: (signal: AbortSignal) => Promise<void>): Promise<CheckResult> {
  const started = performance.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);
  try {
    await Promise.race([
      check(controller.signal),
      new Promise<never>((_, reject) =>
        controller.signal.addEventListener("abort", () => reject(new Error("timeout")))
      ),
    ]);
    return { ok: true, latencyMs: Math.round(performance.now() - started) };
  } catch (err) {
    return {
      ok: false,
      latencyMs: Math.round(performance.now() - started),
      error: err instanceof Error ? err.message : "unknown error",
    };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Liveness + dependency check for uptime monitors.
 * 200 when Postgres and Stellar Horizon both respond, 503 otherwise.
 * Never returns row counts or other business data.
 */
export async function GET() {
  await connection(); // always evaluate at request time, never prerender

  const [database, horizon] = await Promise.all([
    timed(async () => {
      await prisma.$queryRaw`SELECT 1`;
    }),
    timed(async (signal) => {
      const res = await fetch(HORIZON_URL, { signal, cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    }),
  ]);

  const ok = database.ok && horizon.ok;
  if (!ok) {
    log.warn("health.degraded", {
      databaseOk: database.ok,
      databaseError: database.error,
      horizonOk: horizon.ok,
      horizonError: horizon.error,
    });
  }

  return NextResponse.json(
    {
      ok,
      checks: {
        database: { ok: database.ok, latencyMs: database.latencyMs },
        horizon: { ok: horizon.ok, latencyMs: horizon.latencyMs },
      },
      version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "dev",
      time: new Date().toISOString(),
    },
    { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store" } }
  );
}
