import type { Instrumentation } from "next";

/**
 * Logs every uncaught Server Component, Route Handler, Server Action and Proxy
 * error as one structured JSON line (see src/server/log.ts), so Vercel log
 * search / drains can alert on `"level":"error"`.
 */
export const onRequestError: Instrumentation.onRequestError = async (err, request, context) => {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { log } = await import("@/server/log");
  log.error(
    "request.unhandled_error",
    {
      method: request.method,
      // Order links carry capability tokens; never log them.
      path: request.path.replace(/\/(o|api\/orders)\/[0-9a-f]{16,}/gi, "/$1/[token]"),
      routePath: context.routePath,
      routeType: context.routeType,
    },
    err
  );
};
