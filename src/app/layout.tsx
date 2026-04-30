import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { GLOBAL_KEYWORDS } from "@/lib/seo";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const siteUrl = "https://getinvita.com";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "GetInvita - Beautiful Event Websites",
    template: "%s | GetInvita",
  },
  description:
    "Custom event websites for Quinceañeras, Weddings, Birthdays & Baby Showers. Upload photos, music, and details — get a stunning event page.",
  keywords: GLOBAL_KEYWORDS,
  openGraph: {
    type: "website",
    siteName: "GetInvita",
    title: "GetInvita - Beautiful Event Websites",
    description:
      "Custom event websites for Quinceañeras, Weddings, Birthdays & Baby Showers. Upload photos, music, and details — get a stunning event page.",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "GetInvita - Beautiful Event Websites",
    description:
      "Custom event websites for Quinceañeras, Weddings, Birthdays & Baby Showers.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "GetInvita",
    url: siteUrl,
    description:
      "Custom event websites for Quinceañeras, Weddings, Birthdays & Baby Showers.",
  };

  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
