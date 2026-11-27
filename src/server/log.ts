type Level = "debug" | "info" | "warn" | "error";
type Context = Record<string, unknown>;

const LEVEL_ORDER: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };

function minLevel(): number {
  const raw = process.env.LOG_LEVEL?.trim().toLowerCase() as Level | undefined;
  if (raw && raw in LEVEL_ORDER) return LEVEL_ORDER[raw];
  return process.env.NODE_ENV === "production" ? LEVEL_ORDER.info : LEVEL_ORDER.debug;
}

/** Keys whose values must never reach logs or error trackers. */
const REDACTED_KEYS = /(password|secret|token|authorization|cookie|otp|code|email|phone|address)/i;

function redact(context: Context | undefined): Context | undefined {
  if (!context) return undefined;
  const out: Context = {};
  for (const [key, value] of Object.entries(context)) {
    out[key] = REDACTED_KEYS.test(key) ? "[redacted]" : value;
  }
  return out;
}

function serializeError(err: unknown): Context | undefined {
  if (err === undefined) return undefined;
  if (err instanceof Error) {
    return {
      name: err.name,
      message: err.message,
      stack: err.stack,
      ...("digest" in err ? { digest: String((err as { digest: unknown }).digest) } : {}),
    };
  }
  return { message: String(err) };
}

function emit(level: Level, msg: string, context?: Context, err?: unknown): void {
  if (LEVEL_ORDER[level] < minLevel()) return;

  const entry = {
    ts: new Date().toISOString(),
    level,
    msg,
    ...redact(context),
    ...(err !== undefined ? { err: serializeError(err) } : {}),
  };
  const line = JSON.stringify(entry);

  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

/**
 * Structured JSON logger for server code. One line per event so Vercel/Logtail
 * can index and alert on fields.
 * Context keys that look like PII or secrets (email, phone, code, token…) are redacted.
 */
export const log = {
  debug: (msg: string, context?: Context) => emit("debug", msg, context),
  info: (msg: string, context?: Context) => emit("info", msg, context),
  warn: (msg: string, context?: Context, err?: unknown) => emit("warn", msg, context, err),
  error: (msg: string, context?: Context, err?: unknown) => emit("error", msg, context, err),
};
