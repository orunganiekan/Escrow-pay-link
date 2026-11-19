import { config as loadEnv } from "dotenv";
import {
  Asset,
  Keypair,
  Operation,
  TransactionBuilder,
} from "@stellar/stellar-sdk";
import {
  FRIENDBOT_URL,
  getHorizon,
  isHorizonNotFound,
  STELLAR_BASE_FEE,
  STELLAR_NETWORK_PASSPHRASE,
  STELLAR_TX_TIMEOUT_SECONDS,
  submitStellarTransaction,
} from "../src/server/stellar/config";

loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

async function ensureFriendbotFunded(publicKey: string, label: string) {
  const horizon = getHorizon();
  try {
    await horizon.loadAccount(publicKey);
    console.log(`[bootstrap] ${label} (${publicKey}) already funded.`);
    return;
  } catch (err: unknown) {
    if (!isHorizonNotFound(err)) throw err;
  }

  console.log(`[bootstrap] Funding ${label} (${publicKey}) via Friendbot...`);
  const res = await fetch(
    `${FRIENDBOT_URL}?addr=${encodeURIComponent(publicKey)}`
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Friendbot failed for ${label} (${res.status}): ${text}`);
  }
}

function loadOrGenerateKeypair(envName: string): Keypair {
  const existing = process.env[envName]?.trim();
  if (existing) {
    return Keypair.fromSecret(existing);
  }
  return Keypair.random();
}

async function ensureEscrowNgnTrustline(escrow: Keypair, issuer: Keypair) {
  const horizon = getHorizon();
  const escrowAccount = await horizon.loadAccount(escrow.publicKey());
  const ngnAsset = new Asset("NGN", issuer.publicKey());

  const hasTrustline = escrowAccount.balances.some(
    (b) =>
      (b.asset_type === "credit_alphanum4" ||
        b.asset_type === "credit_alphanum12") &&
      b.asset_code === ngnAsset.code &&
      b.asset_issuer === ngnAsset.issuer
  );

  if (hasTrustline) {
    console.log("[bootstrap] ESCROW already has NGN trustline.");
    return;
  }

  console.log("[bootstrap] Adding NGN trustline to ESCROW...");
  const tx = new TransactionBuilder(escrowAccount, {
    fee: STELLAR_BASE_FEE,
    networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
  })
    .addOperation(
      Operation.changeTrust({
        asset: ngnAsset,
      })
    )
    .setTimeout(STELLAR_TX_TIMEOUT_SECONDS)
    .build();

  tx.sign(escrow);
  const hash = await submitStellarTransaction(tx);
  console.log(`[bootstrap] ESCROW NGN trustline tx: ${hash}`);
}

async function main() {
  const treasury = loadOrGenerateKeypair("TREASURY_SECRET");
  const issuer = loadOrGenerateKeypair("ISSUER_SECRET");
  const escrow = loadOrGenerateKeypair("ESCROW_SECRET");

  await ensureFriendbotFunded(treasury.publicKey(), "TREASURY");
  await ensureFriendbotFunded(issuer.publicKey(), "ISSUER");
  await ensureFriendbotFunded(escrow.publicKey(), "ESCROW");

  await ensureEscrowNgnTrustline(escrow, issuer);

  console.log("\n=== Add these secrets to .env.local and Vercel ===");
  console.log(`TREASURY_SECRET="${treasury.secret()}"`);
  console.log(`ISSUER_SECRET="${issuer.secret()}"`);
  console.log(`ESCROW_SECRET="${escrow.secret()}"`);
  console.log("\nPublic keys (for reference):");
  console.log(`TREASURY_PUBLIC=${treasury.publicKey()}`);
  console.log(`ISSUER_PUBLIC=${issuer.publicKey()}`);
  console.log(`ESCROW_PUBLIC=${escrow.publicKey()}`);
}

main().catch((err) => {
  console.error("[bootstrap] Error:", err);
  process.exit(1);
});
