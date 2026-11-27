import { expect, test } from "@playwright/test";

/**
 * Full buyer checkout against a real deployment (Paystack test mode).
 *   E2E_BASE_URL=https://<preview>.vercel.app E2E_PRODUCT_SLUG=<active-slug> npx playwright test checkout
 */
const slug = process.env.E2E_PRODUCT_SLUG;

test.describe("buyer checkout", () => {
  test.skip(!process.env.E2E_BASE_URL || !slug, "needs E2E_BASE_URL and E2E_PRODUCT_SLUG");

  test("pays into escrow via Paystack and shows the consent links", async ({ page }) => {
    await page.goto(`/p/${slug}`);

    await expect(page.getByRole("link", { name: "Escrow Agreement" }).first()).toHaveAttribute(
      "href",
      "/legal/escrow"
    );

    await page.getByLabel(/full name/i).fill("E2E Buyer");
    await page.getByLabel(/phone/i).fill("08030000000");
    await page.getByLabel(/email/i).fill(`e2e+${Date.now()}@example.com`);
    await page.getByLabel(/street/i).fill("1 Allen Avenue");
    await page.getByLabel(/city|area/i).fill("Ikeja");
    await page.getByLabel(/state/i).selectOption("Lagos");

    await page.getByRole("button", { name: /pay .* safely/i }).first().click();
    await page.waitForURL(/checkout\.paystack\.com|\/o\/[0-9a-f]{32}/, { timeout: 30_000 });
  });
});
