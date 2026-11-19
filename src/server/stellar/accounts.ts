import { Operation, TransactionBuilder } from "@stellar/stellar-sdk";
import {
  getHorizon,
  getNgnAsset,
  getPlatformKeypair,
  isHorizonNotFound,
  STELLAR_BASE_FEE,
  STELLAR_NETWORK_PASSPHRASE,
  STELLAR_TX_TIMEOUT_SECONDS,
  submitStellarTransaction,
} from "./config";
import { createPrivyStellarWallet, signTransactionWithPrivy } from "./privy";

const STARTING_BALANCE_XLM = "3";

/**
 * Provisions a Privy Stellar wallet, activates it on Stellar Testnet with 3 XLM
 * from TREASURY, and establishes the platform NGN trustline in one atomic tx.
 */
export async function createPrivyStellarAccount(): Promise<{
  publicKey: string;
  privyWalletId: string;
}> {
  const { privyWalletId, publicKey } = await createPrivyStellarWallet();
  const treasury = getPlatformKeypair("TREASURY");
  const horizon = getHorizon();
  const treasuryAccount = await horizon.loadAccount(treasury.publicKey());

  const tx = new TransactionBuilder(treasuryAccount, {
    fee: STELLAR_BASE_FEE,
    networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
  })
    .addOperation(
      Operation.createAccount({
        destination: publicKey,
        startingBalance: STARTING_BALANCE_XLM,
      })
    )
    .addOperation(
      Operation.changeTrust({
        asset: getNgnAsset(),
        source: publicKey,
      })
    )
    .setTimeout(STELLAR_TX_TIMEOUT_SECONDS)
    .build();

  tx.sign(treasury);
  await signTransactionWithPrivy(tx, privyWalletId, publicKey);
  await submitStellarTransaction(tx);

  return { publicKey, privyWalletId };
}

/**
 * Reads an account's test NGN balance from Stellar Horizon.
 * Returns "0" if the account or NGN trustline does not exist yet.
 */
export async function getNgnBalance(publicKey: string): Promise<string> {
  const ngn = getNgnAsset();
  try {
    const account = await getHorizon().loadAccount(publicKey);
    const line = account.balances.find(
      (b) =>
        (b.asset_type === "credit_alphanum4" ||
          b.asset_type === "credit_alphanum12") &&
        b.asset_code === ngn.code &&
        b.asset_issuer === ngn.issuer
    );
    return line ? line.balance : "0";
  } catch (err: unknown) {
    if (isHorizonNotFound(err)) {
      return "0";
    }
    throw err;
  }
}
