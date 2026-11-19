import {
  Asset,
  Horizon,
  Keypair,
  Networks,
  NotFoundError,
  Transaction,
} from "@stellar/stellar-sdk";

export type PlatformRole = "TREASURY" | "ISSUER" | "ESCROW";

export const STELLAR_NETWORK_PASSPHRASE = Networks.TESTNET;
export const HORIZON_URL =
  process.env.STELLAR_HORIZON_URL || "https://horizon-testnet.stellar.org";
export const FRIENDBOT_URL = "https://friendbot.stellar.org";
export const STELLAR_TX_TIMEOUT_SECONDS = 60;
export const STELLAR_BASE_FEE = "1000";

let cachedHorizon: Horizon.Server | null = null;

/**
 * Returns a shared Horizon client for Stellar Testnet.
 */
export function getHorizon(): Horizon.Server {
  if (!cachedHorizon) {
    cachedHorizon = new Horizon.Server(HORIZON_URL);
  }
  return cachedHorizon;
}

/**
 * Loads one of the platform Keypairs from environment variables.
 */
export function getPlatformKeypair(role: PlatformRole): Keypair {
  const envName = `${role}_SECRET`;
  const secret = process.env[envName]?.trim();
  if (!secret) {
    throw new Error(`Missing ${envName} environment variable.`);
  }
  return Keypair.fromSecret(secret);
}

/**
 * Returns the test NGN asset issued by the platform ISSUER account.
 */
export function getNgnAsset(): Asset {
  return new Asset("NGN", getPlatformKeypair("ISSUER").publicKey());
}

/**
 * Formats a positive decimal amount to at most 7 decimal places for Stellar operations.
 */
export function formatStellarAmount(amount: string | number): string {
  const raw = typeof amount === "number" ? amount.toString() : amount.trim();
  if (!/^\d+(\.\d+)?$/.test(raw)) {
    throw new Error(`Invalid Stellar amount: "${amount}"`);
  }
  const num = Number(raw);
  if (!Number.isFinite(num) || num <= 0) {
    throw new Error(`Stellar amount must be positive: "${amount}"`);
  }
  const [whole, frac = ""] = raw.split(".");
  if (frac.length > 7) {
    return num.toFixed(7);
  }
  return frac.length > 0 ? `${whole}.${frac}` : whole;
}

/**
 * Returns true if a Horizon request threw a 404 NotFoundError.
 */
export function isHorizonNotFound(err: unknown): boolean {
  if (err instanceof NotFoundError) return true;
  return (err as { response?: { status?: number } }).response?.status === 404;
}

/**
 * Submits a signed Stellar transaction and returns its hash, surfacing Horizon result codes on failure.
 */
export async function submitStellarTransaction(
  tx: Transaction
): Promise<string> {
  try {
    const res = await getHorizon().submitTransaction(tx);
    return res.hash;
  } catch (err: unknown) {
    const horizonErr = err as {
      message?: string;
      response?: {
        status?: number;
        data?: {
          title?: string;
          detail?: string;
          extras?: { result_codes?: unknown };
        };
      };
    };
    const codes = horizonErr.response?.data?.extras?.result_codes;
    if (codes) {
      throw new Error(
        `Stellar tx failed (${JSON.stringify(codes)}): ${
          horizonErr.response?.data?.detail || horizonErr.message
        }`
      );
    }
    throw err;
  }
}
