import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dolce — Crêperie à Ariana",
  description:
    "Exploring the sweet side of life with Dolce. Crêpes, pancakes, bubble waffles et plus à Ariana, Tunisie.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${playfair.variable} ${inter.variable} min-h-screen bg-dolce-bg font-inter text-dolce-text antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
