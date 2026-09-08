import "@/styles/globals.css";
import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import type { ReactNode } from "react";

const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-dm-sans"
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Shining PDF Tools",
    template: "%s — Shining PDF Tools"
  },
  description: "Free browser-based PDF tools for everyday office tasks.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.svg", type: "image/svg+xml" }
    ],
    apple: { url: "/og-image.jpg", type: "image/jpeg" }
  },
  openGraph: {
    type: "website",
    siteName: "Shining PDF Tools",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Shining PDF Tools",
        type: "image/jpeg"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-image.jpg"]
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body className={dmSans.className}>{children}</body>
    </html>
  );
}
