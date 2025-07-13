// src/app/layout.tsx
import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import {Providers} from "./providers";
import {AuthProvider} from "@/lib/auth";
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
  title: "Web Crawler Dashboard",
  description:
    "Add URLs, crawl pages, and inspect link breakdowns in real time.",
  keywords: ["web crawler", "SEO", "link analysis", "dashboard"],
  openGraph: {
    title: "Web Crawler Dashboard",
    description: "Crawl any site and view its link structure instantly.",
    url: "https://your-domain.com",
    siteName: "Web Crawler",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <head>
        {/* Required meta tags */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        {/* description, keywords, favicon & Open Graph tags generated via `metadata` */}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Skip link for keyboard users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only p-2 bg-blue-600 text-white fixed top-2 left-2 z-50">
          Skip to content
        </a>

        <Providers>
          <AuthProvider>{children}</AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
