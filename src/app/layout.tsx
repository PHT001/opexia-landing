import type { Metadata } from "next";
import { DM_Sans, Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "OpexIA — Agence IA | Sites, Chatbots & Automatisations",
    template: "%s | OpexIA",
  },
  description:
    "Agence IA sp\u00e9cialis\u00e9e : sites web, chatbots intelligents, automatisations et agents IA pour booster votre entreprise. Audit gratuit.",
  keywords: [
    "agence IA",
    "chatbot IA",
    "automatisation entreprise",
    "intelligence artificielle",
    "site web IA",
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "OpexIA \u2014 Agence IA | Sites, Chatbots & Automatisations",
    description: "Agence IA sp\u00e9cialis\u00e9e : sites web, chatbots, automatisations et agents IA pour booster votre entreprise.",
    type: "website",
    locale: "fr_FR",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body
        className={`${dmSans.variable} ${outfit.variable} ${jetbrains.variable} antialiased`}
        style={{ fontFamily: "var(--font-dm), system-ui, sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
