import type { Metadata, Viewport } from "next";
import "./globals.css";
import { MetaPixel } from "@/components/MetaPixel";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Vantom — Sneakers premium", template: "%s · Vantom" },
  description:
    "Sneakers premium livrées en Afrique de l'Ouest. Paiement Mobile Money, sans compte.",
  openGraph: {
    title: "Vantom — Sneakers premium",
    description: "Sneakers premium, paiement Mobile Money.",
    type: "website",
  },
};

/*
 * TYPO — Inter. En production (Vercel, accès réseau), décommentez le <link>
 * ci-dessous pour charger Inter depuis Google Fonts. En local sans réseau,
 * la pile système prend le relais (rendu quasi identique).
 *
 *   <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
 *   <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
 */

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <MetaPixel />
        {children}
      </body>
    </html>
  );
}
