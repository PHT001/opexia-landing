import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = "https://opexia-agency.com";
const SITE_NAME = "OpexIA";
const SITE_TITLE = "OpexIA — Agence IA & Automatisation pour Entreprises | Chatbots, Agents IA & Infrastructure";
const SITE_DESCRIPTION =
  "OpexIA est l'agence IA n°1 en France spécialisée dans l'automatisation des entreprises. Chatbots IA, agents intelligents, infrastructure IA, automatisation des processus métier. Audit gratuit, déploiement en 14 jours, ROI garanti. +50 entreprises accompagnées.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    // Mots-clés principaux (head terms)
    "agence IA",
    "agence intelligence artificielle",
    "agence automatisation",
    "infrastructure IA",
    "automatisation entreprise",
    // Mots-clés secondaires (mid-tail)
    "chatbot IA entreprise",
    "agent IA entreprise",
    "automatisation processus métier",
    "intégration IA entreprise",
    "transformation digitale IA",
    "déploiement IA",
    "consultant IA",
    "prestataire IA",
    // Longue traîne (long-tail) — forte intention
    "agence IA France",
    "agence IA Paris",
    "automatisation IA PME",
    "chatbot intelligent entreprise",
    "automatiser son entreprise avec IA",
    "mise en place IA entreprise",
    "audit IA gratuit",
    "agence chatbot GPT",
    "automatisation tâches répétitives IA",
    "infrastructure intelligence artificielle entreprise",
    "agents IA sur mesure",
    "IA pour TPE PME",
    "IA pour BTP",
    "IA pour immobilier",
    "IA pour commerce",
    "IA pour cabinet comptable",
    "ROI intelligence artificielle",
    "gain de temps IA",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    type: "website",
    locale: "fr_FR",
    url: SITE_URL,
    siteName: SITE_NAME,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "OpexIA — Agence IA & Automatisation pour Entreprises",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/og-image.png"],
    creator: "@opexia_agency",
  },
  alternates: {
    canonical: SITE_URL,
  },
  category: "technology",
  creator: "OpexIA",
  publisher: "OpexIA",
  formatDetection: {
    telephone: true,
    email: true,
  },
  other: {
    "google-site-verification": "",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#007AFF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body
        className={`${dmSans.variable} ${jetbrains.variable} antialiased`}
        style={{ fontFamily: "var(--font-dm), system-ui, sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
