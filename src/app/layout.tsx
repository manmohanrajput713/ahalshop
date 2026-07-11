import type { Metadata } from "next";
import { Lora, Jost } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers/Providers";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/react";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "ASHL Herbal — A Step For Happy Life | Natural Skincare & Hair Care",
    template: "%s | ASHL Herbal"
  },
  description: "Shop 100% natural herbal skincare and hair care products by ASHL Herbal. No artificial colors, no synthetic fragrances. Dermatologically tested, for all skin & hair types.",
  keywords: ["herbal skincare", "natural hair care", "ayurvedic beauty", "ASHL herbal", "organic cosmetics", "chemical free skincare"],
  authors: [{ name: "ASHL Herbal" }],
  creator: "ASHL Herbal",
  publisher: "ASHL Herbal",
  metadataBase: new URL("https://www.ashlshop.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://www.ashlshop.com",
    title: "ASHL Herbal — A Step For Happy Life",
    description: "Shop 100% natural herbal skincare and hair care products by ASHL Herbal. Dermatologically tested, for all skin & hair types.",
    siteName: "ASHL Herbal",
    images: [{
      url: "/products/logo.png",
      width: 800,
      height: 600,
      alt: "ASHL Herbal Logo"
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ASHL Herbal — Natural Skincare & Hair Care",
    description: "Shop 100% natural herbal skincare and hair care products by ASHL Herbal.",
    images: ["/products/logo.png"],
  },
  icons: {
    icon: "/products/favicon.png",
    apple: "/products/favicon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${lora.variable} ${jost.variable}`}>
      <body className="min-h-screen antialiased" style={{ fontFamily: "var(--font-jost), sans-serif" }}>
        <Providers>
          {children}
        </Providers>
      </body>
      {process.env.NEXT_PUBLIC_GA_ID && <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />}
      <Analytics />
    </html>
  );
}
