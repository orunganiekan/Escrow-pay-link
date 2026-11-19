import {
  Claimant,
  Operation,
  TransactionBuilder,
} from "@stellar/stellar-sdk";
import {
  formatStellarAmount,
  getHorizon,
  getNgnAsset,
  getPlatformKeypair,
  isHorizonNotFound,
  STELLAR_BASE_FEE,
  STELLAR_NETWORK_PASSPHRASE,
  STELLAR_TX_TIMEOUT_SECONDS,
  submitStellarTransaction,
} from "./config";
import { signTransactionWithPrivy } from "./privy";

export interface EscrowService {
  create(params: {
    buyerPublicKey: string;
    buyerPrivyWalletId: string;
    amountNgn: string;
    deadlineUnix: number;
  }): Promise<{ claimableBalanceId: string; txHash: string }>;

  mintAndCreate(params: {
    buyerPublicKey: string;
    buyerPrivyWalletId: string;
    amountNgn: string;
    deadlineUnix: number;
  }): Promise<{ claimableBalanceId: string; txHash: string }>;

  release(params: {
    claimableBalanceId: string;
    vendorPublicKey: string;
    amountNgn: string;
  }): Promise<{ txHash: string }>;

  refund(params: {
    claimableBalanceId: string;
    buyerPublicKey: string;
    buyerPrivyWalletId: string;
  }): Promise<{ txHash: string }>;

  adminRefund(params: {
    claimableBalanceId: string;
    buyerPublicKey: string;
    amountNgn: string;
  }): Promise<{ txHash: string }>;

  status(claimableBalanceId: string): Promise<"OPEN" | "CLAIMED" | "UNKNOWN">;
}

/**
 * Mints test NGN from the platform ISSUER account to a recipient with an NGN trustline.
 */
export async function mintTestNgn(
  toPublic: string,
  amountNgn: string
): Promise<{ txHash: string }> {
  const issuer = getPlatformKeypair("ISSUER");
  const horizon = getHorizon();
  const issuerAccount = await horizon.loadAccount(issuer.publicKey());

  const tx = new TransactionBuilder(issuerAccount, {
    fee: STELLAR_BASE_FEE,
    networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
  })
    .addOperation(
      Operation.payment({
        destination: toPublic,
        asset: getNgnAsset(),
        amount: formatStellarAmount(amountNgn),
      })
    )
    .setTimeout(STELLAR_TX_TIMEOUT_SECONDS)
    .build();

  tx.sign(issuer);
  const txHash = await submitStellarTransaction(tx);
  return { txHash };
}

function buildEscrowClaimants(
  buyerPublicKey: string,
  deadlineUnix: number
): [Claimant, Claimant] {
  const escrowPublic = getPlatformKeypair("ESCROW").publicKey();
  const beforeDeadline = Claimant.predicateBeforeAbsoluteTime(
    String(Math.floor(deadlineUnix))
  );
  return [
    new Claimant(escrowPublic, beforeDeadline),
    new Claimant(buyerPublicKey, Claimant.predicateNot(beforeDeadline)),
  ];
}

export class ClaimableBalanceEscrow implements EscrowService {
  async create(params: {
    buyerPublicKey: string;
    buyerPrivyWalletId: string;
    amountNgn: string;
    deadlineUnix: number;
  }): Promise<{ claimableBalanceId: string; txHash: string }> {
    const horizon = getHorizon();
    const buyerAccount = await horizon.loadAccount(params.buyerPublicKey);
    const claimants = buildEscrowClaimants(
      params.buyerPublicKey,
      params.deadlineUnix
    );

    const tx = new TransactionBuilder(buyerAccount, {
      fee: STELLAR_BASE_FEE,
      networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
    })
      .addOperation(
        Operation.createClaimableBalance({
          asset: getNgnAsset(),
          amount: formatStellarAmount(params.amountNgn),
          claimants,
        })
      )
      .setTimeout(STELLAR_TX_TIMEOUT_SECONDS)
      .build();

    const claimableBalanceId = tx.getClaimableBalanceId(0);
    await signTransactionWithPrivy(
      tx,
      params.buyerPrivyWalletId,
      params.buyerPublicKey
    );
    const txHash = await submitStellarTransaction(tx);
    return { claimableBalanceId, txHash };
  }

  /**
   * Atomically mints test NGN from ISSUER to buyer and locks it into an escrow
   * claimable balance in a single Stellar transaction (~5s ledger close).
   */
  async mintAndCreate(params: {
    buyerPublicKey: string;
    buyerPrivyWalletId: string;
    amountNgn: string;
    deadlineUnix: number;
  }): Promise<{ claimableBalanceId: string; txHash: string }> {
    const issuer = getPlatformKeypair("ISSUER");
    const horizon = getHorizon();
    const issuerAccount = await horizon.loadAccount(issuer.publicKey());
    const amount = formatStellarAmount(params.amountNgn);
    const ngnAsset = getNgnAsset();
    const claimants = buildEscrowClaimants(
      params.buyerPublicKey,
      params.deadlineUnix
    );

    const tx = new TransactionBuilder(issuerAccount, {
      fee: STELLAR_BASE_FEE,
      networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
    })
      .addOperation(
        Operation.payment({
          destination: params.buyerPublicKey,
          asset: ngnAsset,
          amount,
        })
      )
      .addOperation(
        Operation.createClaimableBalance({
          source: params.buyerPublicKey,
          asset: ngnAsset,
          amount,
          claimants,
        })
      )
      .setTimeout(STELLAR_TX_TIMEOUT_SECONDS)
      .build();

    const claimableBalanceId = tx.getClaimableBalanceId(1);
    tx.sign(issuer);
    await signTransactionWithPrivy(
      tx,
      params.buyerPrivyWalletId,
      params.buyerPublicKey
    );
    const txHash = await submitStellarTransaction(tx);
    return { claimableBalanceId, txHash };
  }

  private async claimAndPay(
    claimableBalanceId: string,
    destinationPublicKey: string,
    amountNgn: string
  ): Promise<{ txHash: string }> {
    const escrow = getPlatformKeypair("ESCROW");
    const horizon = getHorizon();
    const escrowAccount = await horizon.loadAccount(escrow.publicKey());

    const tx = new TransactionBuilder(escrowAccount, {
      fee: STELLAR_BASE_FEE,
      networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
    })
      .addOperation(
        Operation.claimClaimableBalance({
          balanceId: claimableBalanceId,
        })
      )
      .addOperation(
        Operation.payment({
          destination: destinationPublicKey,
          asset: getNgnAsset(),
          amount: formatStellarAmount(amountNgn),
        })
      )
      .setTimeout(STELLAR_TX_TIMEOUT_SECONDS)
      .build();

    tx.sign(escrow);
    const txHash = await submitStellarTransaction(tx);
    return { txHash };
  }

  async release(params: {
    claimableBalanceId: string;
    vendorPublicKey: string;
    amountNgn: string;
  }): Promise<{ txHash: string }> {
    return this.claimAndPay(
      params.claimableBalanceId,
      params.vendorPublicKey,
      params.amountNgn
    );
  }

  async refund(params: {
    claimableBalanceId: string;
    buyerPublicKey: string;
    buyerPrivyWalletId: string;
  }): Promise<{ txHash: string }> {
    const horizon = getHorizon();
    const buyerAccount = await horizon.loadAccount(params.buyerPublicKey);

    const tx = new TransactionBuilder(buyerAccount, {
      fee: STELLAR_BASE_FEE,
      networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
    })
      .addOperation(
        Operation.claimClaimableBalance({
          balanceId: params.claimableBalanceId,
        })
      )
      .setTimeout(STELLAR_TX_TIMEOUT_SECONDS)
      .build();

    await signTransactionWithPrivy(
      tx,
      params.buyerPrivyWalletId,
      params.buyerPublicKey
    );
    const txHash = await submitStellarTransaction(tx);
    return { txHash };
  }

  async adminRefund(params: {
    claimableBalanceId: string;
    buyerPublicKey: string;
    amountNgn: string;
  }): Promise<{ txHash: string }> {
    return this.claimAndPay(
      params.claimableBalanceId,
      params.buyerPublicKey,
      params.amountNgn
    );
  }

  async status(
    claimableBalanceId: string
  ): Promise<"OPEN" | "CLAIMED" | "UNKNOWN"> {
    const horizon = getHorizon();
    try {
      await horizon
        .claimableBalances()
        .claimableBalance(claimableBalanceId)
        .call();
      return "OPEN";
    } catch (err: unknown) {
      if (!isHorizonNotFound(err)) {
        throw err;
      }
    }

    try {
      const ops = await horizon
        .operations()
        .forClaimableBalance(claimableBalanceId)
        .limit(5)
        .call();
      return ops.records.length > 0 ? "CLAIMED" : "UNKNOWN";
    } catch {
      return "UNKNOWN";
    }
  }
}

export const escrowService: EscrowService = new ClaimableBalanceEscrow();
