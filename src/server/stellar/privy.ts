import type { Transaction } from "@stellar/stellar-sdk";

const PRIVY_API_BASE = "https://api.privy.io/v1";

function getPrivyAuthHeaders(): {
  Authorization: string;
  "privy-app-id": string;
  "Content-Type": string;
} {
  const appId = process.env.PRIVY_APP_ID?.trim();
  const appSecret = process.env.PRIVY_APP_SECRET?.trim();
  if (!appId || !appSecret) {
    throw new Error(
      "Missing PRIVY_APP_ID or PRIVY_APP_SECRET environment variables."
    );
  }
  const basic = Buffer.from(`${appId}:${appSecret}`, "utf8").toString(
    "base64"
  );
  return {
    Authorization: `Basic ${basic}`,
    "privy-app-id": appId,
    "Content-Type": "application/json",
  };
}

interface PrivyWalletResponse {
  id: string;
  address: string;
  chain_type: string;
}

interface PrivyRawSignResponse {
  method: string;
  data: {
    signature: string;
    encoding: string;
  };
}

/**
 * Creates a Privy Server Wallet on the Stellar chain (Tier 2 Ed25519).
 */
export async function createPrivyStellarWallet(): Promise<{
  privyWalletId: string;
  publicKey: string;
}> {
  const res = await fetch(`${PRIVY_API_BASE}/wallets`, {
    method: "POST",
    headers: getPrivyAuthHeaders(),
    body: JSON.stringify({ chain_type: "stellar" }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `Privy create wallet failed (${res.status}): ${body}`
    );
  }

  const wallet = (await res.json()) as PrivyWalletResponse;
  if (!wallet.id || !wallet.address) {
    throw new Error("Privy create wallet response missing id or address.");
  }

  return {
    privyWalletId: wallet.id,
    publicKey: wallet.address,
  };
}

/**
 * Signs a Stellar Transaction using Privy's Ed25519 raw_sign endpoint and attaches
 * the resulting DecoratedSignature to the transaction envelope.
 */
export async function signTransactionWithPrivy(
  tx: Transaction,
  privyWalletId: string,
  publicKey: string
): Promise<Transaction> {
  const hashHex = `0x${Buffer.from(tx.hash()).toString("hex")}`;

  const res = await fetch(
    `${PRIVY_API_BASE}/wallets/${encodeURIComponent(privyWalletId)}/raw_sign`,
    {
      method: "POST",
      headers: getPrivyAuthHeaders(),
      body: JSON.stringify({
        params: { hash: hashHex },
      }),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Privy raw_sign failed (${res.status}): ${body}`);
  }

  const json = (await res.json()) as PrivyRawSignResponse;
  const rawSig = json.data?.signature;
  if (!rawSig) {
    throw new Error("Privy raw_sign response missing signature.");
  }

  const sigHex = rawSig.startsWith("0x") ? rawSig.slice(2) : rawSig;
  const signatureBytes = Buffer.from(sigHex, "hex");
  if (signatureBytes.length !== 64) {
    throw new Error(
      `Expected 64-byte Ed25519 signature from Privy, got ${signatureBytes.length} bytes.`
    );
  }

  // Validates the Ed25519 signature against publicKey & tx.hash() before attaching.
  tx.addSignature(publicKey, signatureBytes.toString("base64"));

  return tx;
}
