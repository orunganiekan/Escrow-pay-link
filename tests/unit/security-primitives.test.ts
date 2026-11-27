import crypto from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  decrypt,
  encrypt,
  generateReleaseCode,
  hashReleaseCode,
  verifyReleaseCode,
} from "@/server/crypto";
import { maskEmail } from "@/server/orders/buyer-access";
import { toKobo, verifyPaystackWebhookSignature } from "@/server/paystack";

describe("release code crypto", () => {
  it("round-trips AES-256-GCM and rejects tampering", () => {
    const enc = encrypt("123456");
    expect(enc).toMatch(/^v1:/);
    expect(decrypt(enc)).toBe("123456");

    const parts = enc.split(":");
    parts[3] = (parts[3][0] === "0" ? "1" : "0") + parts[3].slice(1);
    expect(() => decrypt(parts.join(":"))).toThrow();
  });

  it("verifies release codes in constant time against the HMAC", () => {
    const hash = hashReleaseCode("482913");
    expect(verifyReleaseCode("482913", hash)).toBe(true);
    expect(verifyReleaseCode(" 482913 ", hash)).toBe(true);
    expect(verifyReleaseCode("482914", hash)).toBe(false);
    expect(verifyReleaseCode("482913", "not-hex")).toBe(false);
  });

  it("generates zero-padded 6-digit codes", () => {
    for (let i = 0; i < 200; i++) expect(generateReleaseCode()).toMatch(/^\d{6}$/);
  });
});

describe("paystack helpers", () => {
  it("converts Naira to integer kobo", () => {
    expect(toKobo("15000.00")).toBe(1_500_000);
    expect(toKobo(0.1 + 0.2)).toBe(30);
    expect(() => toKobo("0")).toThrow();
    expect(() => toKobo("abc")).toThrow();
  });

  it("checks the HMAC-SHA512 webhook signature", () => {
    const body = '{"event":"charge.success"}';
    const sig = crypto.createHmac("sha512", "sk_test_vitest").update(body).digest("hex");
    expect(verifyPaystackWebhookSignature(body, sig)).toBe(true);
    expect(verifyPaystackWebhookSignature(body, null)).toBe(false);
    expect(verifyPaystackWebhookSignature(body, "abc")).toBe(false);
    expect(verifyPaystackWebhookSignature(body + " ", sig)).toBe(false);
  });
});

describe("maskEmail", () => {
  it("hides most of the buyer's address", () => {
    expect(maskEmail("ada@example.com")).toBe("ad***@e***e.com");
    expect(maskEmail("a@b.co")).toBe("a***@b***.co");
    expect(maskEmail(null)).toBeNull();
    expect(maskEmail("nope")).toBeNull();
  });
});
