import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { PWAProvider } from "@/components/pwa-provider"
import { AuthRedirect } from "@/components/auth-redirect"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CreditKeep - Smart Borrowing Tracker",
  description: "Track your daily borrowings and payments with smart analytics. Available offline as a mobile app.",
  keywords: ["borrowing", "finance", "tracker", "money", "debt", "payments", "analytics"],
  authors: [{ name: "CreditKeep Team" }],
  creator: "CreditKeep",
  publisher: "CreditKeep",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CreditKeep",
  },
  openGraph: {
    type: "website",
    siteName: "CreditKeep",
    title: "CreditKeep - Smart Borrowing Tracker",
    description: "Track your daily borrowings and payments with smart analytics",
    images: [
      {
        url: "/icons/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "CreditKeep Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "CreditKeep - Smart Borrowing Tracker",
    description: "Track your daily borrowings and payments with smart analytics",
    images: ["/icons/icon-512x512.png"],
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
}

export const viewport: Viewport = {
  themeColor: "#3b82f6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="CreditKeep" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className={inter.className}>
        <PWAProvider>
          <AuthRedirect>{children}</AuthRedirect>
        </PWAProvider>
      </body>
    </html>
  )
}
