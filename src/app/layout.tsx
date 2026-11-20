import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { getAppUrl } from "@/lib/format";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getAppUrl()),
  title: "EscrowPay — Protected Naira Payment Links",
  description:
    "Sell online without blind trust. Share Naira payment links with delivery-window protection and a 6-digit release code.",
  openGraph: {
    title: "EscrowPay — Sell Online without blind trust",
    description:
      "Protected Naira payment links for WhatsApp and Instagram commerce. Zero signup for buyers, instant settlement on delivery.",
    type: "website",
    siteName: "EscrowPay",
    images: [{ url: "/images/hero-editorial.jpg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "EscrowPay — Sell Online without blind trust",
    description:
      "Protected Naira payment links for WhatsApp and Instagram commerce.",
    images: ["/images/hero-editorial.jpg"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#FFFFFF] text-[#1A1A1A] font-sans flex flex-col">
        {children}
      </body>
    </html>
  );
}
