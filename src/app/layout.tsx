import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { SkipToContent } from "@/components/accessibility";
import { LanguageProvider } from "@/lib/i18n";
import { ErrorBoundaryWrapper } from "@/components/error/error-boundary-wrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "LUXE Store — Premium Electronics & Lifestyle Products",
    template: "%s | LUXE Store",
  },
  description: "Discover premium tech, fashion, and accessories from world-renowned brands. Free shipping on orders over 300 SAR, easy 30-day returns, and AI-powered smart search.",
  keywords: [
    "LUXE Store",
    "electronics",
    "fashion",
    "accessories",
    "online shopping",
    "Saudi Arabia",
    "premium products",
    "wireless headphones",
    "smart watch",
    "gaming",
    "photography",
  ],
  authors: [{ name: "LUXE Store" }],
  creator: "LUXE Store",
  publisher: "LUXE Store",
  icons: {
    icon: "/logo-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "LUXE Store",
    title: "LUXE Store — Premium Electronics & Lifestyle Products",
    description: "Discover premium tech, fashion, and accessories from world-renowned brands. Free shipping, easy returns, and AI-powered smart search.",
  },
  twitter: {
    card: "summary_large_image",
    title: "LUXE Store — Premium Electronics & Lifestyle Products",
    description: "Discover premium tech, fashion, and accessories from world-renowned brands.",
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
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <LanguageProvider>
        <SkipToContent />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ErrorBoundaryWrapper>
            {children}
          </ErrorBoundaryWrapper>
          <Toaster />
        </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
