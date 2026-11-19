import assert from "node:assert/strict";
import { config as loadEnv } from "dotenv";
import {
  createPrivyStellarAccount,
  getNgnBalance,
} from "../src/server/stellar/accounts";
import { ClaimableBalanceEscrow } from "../src/server/stellar/escrow";

loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const escrow = new ClaimableBalanceEscrow();

  console.log("[smoke] 1. Provisioning vendor & buyer Privy Stellar accounts...");
  const vendor = await createPrivyStellarAccount();
  const buyer = await createPrivyStellarAccount();
  console.log(`[smoke] Vendor: ${vendor.publicKey} (wallet ${vendor.privyWalletId})`);
  console.log(`[smoke] Buyer:  ${buyer.publicKey} (wallet ${buyer.privyWalletId})`);

  assert.equal(await getNgnBalance(vendor.publicKey), "0.0000000");

  // ── Test A: mintAndCreate -> early refund fails -> release succeeds ─────────
  console.log("\n[smoke] 2. Test A: mintAndCreate 2500.00 NGN (+60s deadline)...");
  const deadlineA = Math.floor(Date.now() / 1000) + 60;
  const createdA = await escrow.mintAndCreate({
    buyerPublicKey: buyer.publicKey,
    buyerPrivyWalletId: buyer.privyWalletId,
    amountNgn: "2500.00",
    deadlineUnix: deadlineA,
  });
  console.log(`[smoke] Claimable balance A: ${createdA.claimableBalanceId}`);
  console.log(`[smoke] txCreate A:          ${createdA.txHash}`);
  assert.equal(await escrow.status(createdA.claimableBalanceId), "OPEN");

  console.log("[smoke] 3. Verifying buyer refund fails before deadline...");
  let earlyRefundRejected = false;
  try {
    await escrow.refund({
      claimableBalanceId: createdA.claimableBalanceId,
      buyerPublicKey: buyer.publicKey,
      buyerPrivyWalletId: buyer.privyWalletId,
    });
  } catch (err) {
    earlyRefundRejected = true;
    console.log(
      `[smoke] Early refund rejected as expected: ${(err as Error).message}`
    );
  }
  assert.equal(
    earlyRefundRejected,
    true,
    "Refund before deadline should have failed on Stellar"
  );

  console.log("[smoke] 4. Releasing balance A to vendor...");
  const releasedA = await escrow.release({
    claimableBalanceId: createdA.claimableBalanceId,
    vendorPublicKey: vendor.publicKey,
    amountNgn: "2500.00",
  });
  console.log(`[smoke] txRelease A:         ${releasedA.txHash}`);
  assert.equal(await escrow.status(createdA.claimableBalanceId), "CLAIMED");
  assert.equal(await getNgnBalance(vendor.publicKey), "2500.0000000");

  // ── Test B: mintAndCreate -> refund fails before deadline -> succeeds after ─
  console.log("\n[smoke] 5. Test B: mintAndCreate 1000.00 NGN (+10s deadline)...");
  const deadlineB = Math.floor(Date.now() / 1000) + 10;
  const createdB = await escrow.mintAndCreate({
    buyerPublicKey: buyer.publicKey,
    buyerPrivyWalletId: buyer.privyWalletId,
    amountNgn: "1000.00",
    deadlineUnix: deadlineB,
  });
  console.log(`[smoke] Claimable balance B: ${createdB.claimableBalanceId}`);
  console.log(`[smoke] txCreate B:          ${createdB.txHash}`);

  let earlyRefundBRejected = false;
  try {
    await escrow.refund({
      claimableBalanceId: createdB.claimableBalanceId,
      buyerPublicKey: buyer.publicKey,
      buyerPrivyWalletId: buyer.privyWalletId,
    });
  } catch {
    earlyRefundBRejected = true;
  }
  assert.equal(earlyRefundBRejected, true, "Early refund B should fail");

  const waitMs = Math.max(0, (deadlineB + 8) * 1000 - Date.now());
  console.log(
    `[smoke] 6. Waiting ${Math.ceil(waitMs / 1000)}s for ledger close past deadlineB...`
  );
  await sleep(waitMs);

  const refundedB = await escrow.refund({
    claimableBalanceId: createdB.claimableBalanceId,
    buyerPublicKey: buyer.publicKey,
    buyerPrivyWalletId: buyer.privyWalletId,
  });
  console.log(`[smoke] txRefund B:          ${refundedB.txHash}`);
  assert.equal(await escrow.status(createdB.claimableBalanceId), "CLAIMED");
  assert.equal(await getNgnBalance(buyer.publicKey), "1000.0000000");

  console.log("\n[smoke] ALL PHASE 1 CHECKS PASSED.");
}

main().catch((err) => {
  console.error("[smoke] FAILED:", err);
  process.exit(1);
});
