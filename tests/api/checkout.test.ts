import { describe, expect, it } from "vitest";
import { NextResponse } from "next/server";
import { POST as createOrder } from "@/app/api/orders/route";
import { decrypt, verifyReleaseCode } from "@/server/crypto";
import { hasBuyerOrderAccess } from "@/server/orders/buyer-access";
import { seedProduct } from "../helpers/fake-db";
import { jsonRequest } from "../helpers/http";
import { state } from "../helpers/state";

const validBody = {
  productId: "prod_1",
  buyerName: "Ada Obi",
  buyerPhone: "08030000000",
  buyerEmail: "ada@example.com",
  street: "1 Allen Avenue",
  city: "Ikeja",
  state: "Lagos",
  landmark: "Opposite the bank",
};

const checkout = (body: unknown) => createOrder(jsonRequest("http://test/api/orders", body));

describe("POST /api/orders (checkout)", () => {
  it("validates buyer details", async () => {
    seedProduct(state.db);
    const res = await checkout({ ...validBody, buyerEmail: "not-an-email" });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/email/i);
    expect(state.initializePaystackTransaction).not.toHaveBeenCalled();
  });

  it("rejects inactive or missing pay links", async () => {
    seedProduct(state.db, { active: false });
    expect((await checkout(validBody)).status).toBe(404);
    expect((await checkout({ ...validBody, productId: "missing" })).status).toBe(404);
  });

  it("creates a pending order priced from the product, not the client", async () => {
    seedProduct(state.db);
    const res = await checkout({ ...validBody, amountNgn: 1 });
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.redirectUrl).toBe(`/o/${json.token}`);

    const order = [...state.db.orders.values()][0];
    expect(order.status).toBe("PENDING_PAYMENT");
    expect(order.amountNgn.toString()).toBe("15000");
    expect(order.buyerAddress).toBe("1 Allen Avenue, Ikeja, Lagos · Landmark: Opposite the bank");
    expect(state.initializePaystackTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        amountNgn: "15000",
        email: "ada@example.com",
        callbackUrl: `http://localhost:3000/o/${json.token}?verify=1`,
      })
    );
  });

  it("stores the release code only as an HMAC hash plus ciphertext", async () => {
    seedProduct(state.db);
    await checkout(validBody);
    const order = [...state.db.orders.values()][0];
    const code = decrypt(order.codeEnc);
    expect(code).toMatch(/^\d{6}$/);
    expect(order.codeHash).not.toContain(code);
    expect(verifyReleaseCode(code, order.codeHash)).toBe(true);
  });

  it("binds the checkout browser to the order", async () => {
    seedProduct(state.db);
    const res = (await checkout(validBody)) as NextResponse;
    const order = [...state.db.orders.values()][0];
    expect(await hasBuyerOrderAccess(order)).toBe(false);

    state.jar.absorb(res);
    expect(await hasBuyerOrderAccess(order)).toBe(true);
    const cookie = res.cookies.getAll()[0];
    expect(cookie).toMatchObject({ httpOnly: true, sameSite: "lax" });
  });

  it("does not create an order when Paystack initialization fails", async () => {
    seedProduct(state.db);
    state.initializePaystackTransaction.mockRejectedValueOnce(new Error("Paystack down"));
    expect((await checkout(validBody)).status).toBe(502);
    expect(state.db.orders.size).toBe(0);
  });
});
