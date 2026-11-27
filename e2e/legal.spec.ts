import { expect, test } from "@playwright/test";

const DOCS = [
  { path: "/legal/terms", heading: "Terms of Service" },
  { path: "/legal/escrow", heading: "Escrow Agreement" },
  { path: "/legal/privacy", heading: "Privacy Policy" },
];

test.describe("legal pages", () => {
  for (const doc of DOCS) {
    test(`${doc.path} is public and readable`, async ({ page }) => {
      const res = await page.goto(doc.path);
      expect(res?.status()).toBe(200);
      await expect(page).toHaveURL(doc.path); // not bounced to /login by the proxy
      await expect(page.getByRole("heading", { level: 1, name: doc.heading })).toBeVisible();
      await expect(page.getByRole("navigation", { name: "Legal documents" })).toBeVisible();

      // No horizontal scrolling on any viewport.
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  test("privacy policy names the NDPA and the regulator", async ({ page }) => {
    await page.goto("/legal/privacy");
    await expect(page.getByText("Nigeria Data Protection Act 2023").first()).toBeVisible();
    await expect(page.getByText("Nigeria Data Protection Commission").first()).toBeVisible();
  });

  test("legal nav moves between documents", async ({ page }) => {
    await page.goto("/legal/terms");
    await page.getByRole("navigation", { name: "Legal documents" }).getByRole("link", { name: "Escrow" }).click();
    await expect(page).toHaveURL("/legal/escrow");
    await expect(page.getByRole("heading", { level: 1, name: "Escrow Agreement" })).toBeVisible();
  });
});

test("landing footer links to every legal document", async ({ page }) => {
  await page.goto("/");
  const footer = page.locator("footer").last();
  for (const doc of DOCS) {
    await expect(footer.getByRole("link", { name: doc.heading })).toHaveAttribute("href", doc.path);
  }
});
