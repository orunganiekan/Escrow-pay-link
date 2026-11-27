import { defineConfig, devices } from "@playwright/test";

/**
 * E2E suite. By default it builds nothing and starts `next start` on :3100,
 * so run `npm run build` first (CI does). Point E2E_BASE_URL at a deployed
 * preview/staging URL to run the same specs, plus the full checkout spec when
 * E2E_PRODUCT_SLUG is set, against real infrastructure.
 */
const externalBaseUrl = process.env.E2E_BASE_URL;
const port = 3100;

// Placeholder config so the public pages can boot without real services.
const offlineEnv = {
  NEXT_PUBLIC_APP_URL: `http://localhost:${port}`,
  DATABASE_URL: "postgresql://e2e:e2e@127.0.0.1:1/e2e",
  NEON_AUTH_BASE_URL: "http://127.0.0.1:1/auth",
  NEON_AUTH_COOKIE_SECRET: "e2e-cookie-secret-e2e-cookie-secret-e2e",
  ENCRYPTION_KEY: "a".repeat(64),
  PAYSTACK_SECRET_KEY: "sk_test_e2e",
};

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL: externalBaseUrl ?? `http://localhost:${port}`,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: externalBaseUrl
    ? undefined
    : {
        command: `npx next start -p ${port}`,
        url: `http://localhost:${port}/legal/terms`,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        env: { ...offlineEnv, ...(process.env as Record<string, string>) },
      },
});
