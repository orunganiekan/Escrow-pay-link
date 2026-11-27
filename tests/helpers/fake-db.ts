import { Prisma } from "@/generated/prisma/client";
import { hashReleaseCode, encrypt } from "@/server/crypto";

export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PROCESSING_PAYMENT"
  | "SECURED"
  | "SHIPPED"
  | "DISPUTED"
  | "RELEASED"
  | "REFUNDED";

export interface FakeProduct {
  id: string;
  slug: string;
  vendorId: string;
  name: string;
  priceNgn: Prisma.Decimal;
  windowMinutes: number;
  active: boolean;
}

export interface FakeOrder {
  id: string;
  token: string;
  productId: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string | null;
  buyerAddress: string;
  amountNgn: Prisma.Decimal;
  status: OrderStatus;
  paystackReference: string | null;
  paystackAuthorizationUrl: string | null;
  deadline: Date | null;
  shippedAt: Date | null;
  disputeReason: string | null;
  disputedAt: Date | null;
  resolvedAt: Date | null;
  codeHash: string;
  codeEnc: string;
  releaseAttempts: number;
  buyerStellarPublic: string;
  buyerPrivyWalletId: string;
  claimableBalanceId: string | null;
  txCreate: string | null;
  txRelease: string | null;
  txRefund: string | null;
}

type Where = Partial<Record<keyof FakeOrder, unknown>>;

function matches(order: FakeOrder, where: Where): boolean {
  return Object.entries(where).every(([k, v]) => order[k as keyof FakeOrder] === v);
}

function applyData(order: FakeOrder, data: Record<string, unknown>): void {
  for (const [k, v] of Object.entries(data)) {
    if (v && typeof v === "object" && "increment" in v) {
      (order as unknown as Record<string, number>)[k] += (v as { increment: number }).increment;
    } else {
      (order as unknown as Record<string, unknown>)[k] = v;
    }
  }
}

/**
 * Minimal in-memory stand-in for the Prisma calls our route handlers make.
 * Mirrors the semantics that matter for escrow safety: unique lookups,
 * conditional `updateMany` (atomic status claims) and `{ increment }`.
 */
export function createFakeDb() {
  const products = new Map<string, FakeProduct>();
  const orders = new Map<string, FakeOrder>();

  const withProduct = (o: FakeOrder | undefined) =>
    o ? { ...o, product: products.get(o.productId)! } : null;

  const findOrder = (where: Where) => [...orders.values()].find((o) => matches(o, where));

  const db = {
    products,
    orders,
    product: {
      findUnique: async ({ where }: { where: { id: string } }) => products.get(where.id) ?? null,
    },
    order: {
      findUnique: async ({ where }: { where: Where }) => withProduct(findOrder(where)),
      findUniqueOrThrow: async ({ where }: { where: Where }) => {
        const o = findOrder(where);
        if (!o) throw new Error("Order not found");
        return withProduct(o);
      },
      updateMany: async ({ where, data }: { where: Where; data: Record<string, unknown> }) => {
        let count = 0;
        for (const o of orders.values()) {
          if (matches(o, where)) {
            applyData(o, data);
            count++;
          }
        }
        return { count };
      },
      update: async ({ where, data }: { where: Where; data: Record<string, unknown> }) => {
        const o = findOrder(where);
        if (!o) throw new Error("Record to update not found");
        applyData(o, data);
        return { ...o };
      },
      create: async ({ data }: { data: Omit<FakeOrder, "id" | keyof Defaults> & Partial<Defaults> }) => {
        const order = { ...orderDefaults(), ...data, id: `ord_${orders.size + 1}` } as FakeOrder;
        orders.set(order.id, order);
        return { ...order };
      },
    },
    $queryRaw: async () => [{ "?column?": 1 }],
  };
  return db;
}

type Defaults = Pick<
  FakeOrder,
  | "deadline"
  | "shippedAt"
  | "disputeReason"
  | "disputedAt"
  | "resolvedAt"
  | "releaseAttempts"
  | "claimableBalanceId"
  | "txCreate"
  | "txRelease"
  | "txRefund"
>;

function orderDefaults(): Defaults {
  return {
    deadline: null,
    shippedAt: null,
    disputeReason: null,
    disputedAt: null,
    resolvedAt: null,
    releaseAttempts: 0,
    claimableBalanceId: null,
    txCreate: null,
    txRelease: null,
    txRefund: null,
  };
}

export type FakeDb = ReturnType<typeof createFakeDb>;

export const RELEASE_CODE = "482913";

export function seedProduct(db: FakeDb, overrides: Partial<FakeProduct> = {}): FakeProduct {
  const product: FakeProduct = {
    id: "prod_1",
    slug: "ankara-dress",
    vendorId: "vendor_1",
    name: "Ankara Dress",
    priceNgn: new Prisma.Decimal("15000.00"),
    windowMinutes: 60 * 24,
    active: true,
    ...overrides,
  };
  db.products.set(product.id, product);
  return product;
}

export function seedOrder(db: FakeDb, overrides: Partial<FakeOrder> = {}): FakeOrder {
  const order: FakeOrder = {
    ...orderDefaults(),
    id: "ord_1",
    token: "a1b2c3d4e5f60718293a4b5c6d7e8f90",
    productId: "prod_1",
    buyerName: "Ada Obi",
    buyerPhone: "08030000000",
    buyerEmail: "ada@example.com",
    buyerAddress: "1 Allen Avenue, Ikeja, Lagos",
    amountNgn: new Prisma.Decimal("15000.00"),
    status: "SECURED",
    paystackReference: "epl_ref_1",
    paystackAuthorizationUrl: "https://checkout.paystack.com/x",
    codeHash: hashReleaseCode(RELEASE_CODE),
    codeEnc: encrypt(RELEASE_CODE),
    buyerStellarPublic: "GBUYER",
    buyerPrivyWalletId: "privy_buyer_1",
    claimableBalanceId: "cb_1",
    deadline: new Date(Date.now() + 60 * 60 * 1000),
    ...overrides,
  };
  db.orders.set(order.id, order);
  return order;
}
