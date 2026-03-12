import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Redemption Arc — Your Worst Trade Might Be Your Best Story",
  description: "Confess your worst crypto trade. Get your Certificate of Release. Win weekly prizes. Built on BASE.",
  openGraph: {
    title: "Redemption Arc",
    description: "Your worst trade might be your best story.",
    url: "https://redemptionarc.wtf",
    siteName: "Redemption Arc",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
