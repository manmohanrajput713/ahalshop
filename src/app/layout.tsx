import type { Metadata } from "next";
import { Lora, Jost } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers/Providers";

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
  title: "ASHL Herbal — A Step For Happy Life | Natural Skincare & Hair Care",
  description:
    "Shop 100% natural herbal skincare and hair care products by ASHL Herbal. No artificial colors, no synthetic fragrances. Dermatologically tested, for all skin & hair types.",
  icons: {
    icon: "/products/favicon.png",
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
    </html>
  );
}
