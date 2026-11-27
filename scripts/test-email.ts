/**
 * Delivery check for buyer OTP emails.
 *
 *   npx tsx scripts/test-email.ts you@example.com
 *
 * Sends a sample buyer OTP email through the same provider selection production
 * uses (Gmail SMTP -> Resend). When Resend is configured, also lists its domains.
 */
import { config as loadEnv } from "dotenv";
import { sendBuyerOtpEmail } from "../src/server/email";

loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

async function main() {
  const to = process.argv[2];
  if (!to || !to.includes("@")) {
    console.error("Usage: npx tsx scripts/test-email.ts <recipient-email>");
    process.exit(1);
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (process.env.GMAIL_SMTP_USER) {
    console.log(
      `[email] provider: Gmail SMTP as ${process.env.GMAIL_SMTP_USER}`,
    );
  } else if (apiKey) {
    const from =
      process.env.RESEND_FROM_EMAIL?.trim() ||
      "(default) onboarding@resend.dev";
    console.log(`[resend] from: ${from}`);

    const domainsRes = await fetch("https://api.resend.com/domains", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (domainsRes.ok) {
      const { data } = (await domainsRes.json()) as {
        data: { name: string; status: string }[];
      };
      if (data.length === 0) {
        console.warn(
          "[resend] No custom domains on this account — only the account owner's inbox will receive mail.",
        );
      }
      for (const d of data)
        console.log(`[resend] domain ${d.name}: ${d.status}`);
    } else {
      console.warn(
        `[resend] Could not list domains (${domainsRes.status}); key may be send-only.`,
      );
    }
  } else {
    console.error(
      "No email provider configured (GMAIL_SMTP_* or RESEND_API_KEY).",
    );
    process.exit(1);
  }

  const result = await sendBuyerOtpEmail({
    to,
    orderCode: "ORDER #EPL-TEST",
    productName: "Resend delivery test",
    otp: "123456",
    challengeId: `resend-test-${Date.now()}`,
  });

  if (!result.ok) {
    console.error(`[email] FAILED: ${result.error}`);
    process.exit(1);
  }
  console.log(`[email] sent via ${result.mode} to ${to}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
