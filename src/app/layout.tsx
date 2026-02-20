import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
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
  keywords: [
    "event website",
    "quinceañera website",
    "wedding website",
    "birthday website",
    "baby shower website",
    "digital invitations",
    "RSVP",
    "event page",
    "GetInvita",
  ],
  openGraph: {
    type: "website",
    siteName: "GetInvita",
    title: "GetInvita - Beautiful Event Websites",
    description:
      "Custom event websites for Quinceañeras, Weddings, Birthdays & Baby Showers. Upload photos, music, and details — get a stunning event page.",
    url: siteUrl,
    images: [
      {
        url: `${siteUrl}/getinvitalogo.png`,
        width: 1200,
        height: 630,
        alt: "GetInvita",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GetInvita - Beautiful Event Websites",
    description:
      "Custom event websites for Quinceañeras, Weddings, Birthdays & Baby Showers.",
    images: [`${siteUrl}/getinvitalogo.png`],
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
      <body className={`${inter.className} antialiased`}>
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
