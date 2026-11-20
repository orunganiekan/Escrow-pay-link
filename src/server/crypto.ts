import crypto from "node:crypto";

const AES_ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12;
const VERSION_PREFIX = "v1";

function getEncryptionKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY?.trim();
  if (!raw) {
    throw new Error("Missing ENCRYPTION_KEY environment variable.");
  }
  if (!/^[0-9a-fA-F]{64}$/.test(raw)) {
    throw new Error(
      "ENCRYPTION_KEY must be a 64-character hex string (32 bytes)."
    );
  }
  return Buffer.from(raw, "hex");
}

/**
 * Computes a domain-separated HMAC-SHA256 hex digest keyed with ENCRYPTION_KEY.
 */
export function hmacSha256Hex(purpose: string, value: string): string {
  return crypto
    .createHmac("sha256", getEncryptionKey())
    .update(`${purpose}:${value}`, "utf8")
    .digest("hex");
}

/**
 * Constant-time equality check for two hex-encoded digests.
 */
export function constantTimeEqualHex(aHex: string, bHex: string): boolean {
  if (!/^[0-9a-fA-F]+$/.test(aHex) || !/^[0-9a-fA-F]+$/.test(bHex)) {
    return false;
  }
  const a = Buffer.from(aHex, "hex");
  const b = Buffer.from(bHex, "hex");
  if (a.length === 0 || a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/**
 * Encrypts a UTF-8 string using AES-256-GCM with ENCRYPTION_KEY.
 * Format: v1:<ivHex>:<authTagHex>:<ciphertextHex>
 */
export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv(AES_ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return [
    VERSION_PREFIX,
    iv.toString("hex"),
    authTag.toString("hex"),
    encrypted.toString("hex"),
  ].join(":");
}

/**
 * Decrypts a payload produced by encrypt().
 */
export function decrypt(payload: string): string {
  const parts = payload.split(":");
  if (parts.length !== 4 || parts[0] !== VERSION_PREFIX) {
    throw new Error("Invalid encrypted payload format.");
  }
  const [, ivHex, tagHex, dataHex] = parts;
  const key = getEncryptionKey();
  const decipher = crypto.createDecipheriv(
    AES_ALGORITHM,
    key,
    Buffer.from(ivHex, "hex")
  );
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataHex, "hex")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}

/**
 * Computes an HMAC-SHA256 digest of the 6-digit release code using ENCRYPTION_KEY.
 */
export function hashReleaseCode(code: string): string {
  return hmacSha256Hex("release-code", code.trim());
}

/**
 * Constant-time comparison between a candidate release code and its stored HMAC hash.
 */
export function verifyReleaseCode(
  candidate: string,
  expectedHash: string
): boolean {
  return constantTimeEqualHex(hashReleaseCode(candidate), expectedHash);
}

/**
 * Generates a cryptographically random 6-digit code.
 */
export function generateReleaseCode(): string {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
}
