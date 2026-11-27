/**
 * Single source of truth for legal-page entity details.
 * Replace the placeholder values once the operating company, its CAC
 * registration and the licensed PSP/trustee partner are confirmed.
 */
export const LEGAL = {
  brand: "EscrowPay",
  /** Registered company name as on the CAC certificate. */
  entityName: "EscrowPay (company registration pending)",
  /** CAC RC number, e.g. "RC 1234567". Empty until registered. */
  rcNumber: "",
  registeredAddress: "Lagos, Nigeria",
  supportEmail: "escrowpay9@gmail.com",
  /** Data Protection Officer contact required under the NDPA 2023. */
  privacyEmail: "escrowpay9@gmail.com",
  /** Licensed PSP / trustee holding customer funds. Empty until signed. */
  fundsCustodian: "",
  lastUpdated: "27 November 2026",
  /** Shown as a banner until counsel has reviewed and approved the texts. */
  pendingLegalReview: true,
} as const;

export const LEGAL_LINKS = [
  { href: "/legal/terms", label: "Terms of Service" },
  { href: "/legal/escrow", label: "Escrow Agreement" },
  { href: "/legal/privacy", label: "Privacy Policy" },
] as const;
