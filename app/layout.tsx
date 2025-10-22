import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Navigation } from "@/components/layout/navigation"
import { Toaster } from "@/components/ui/sonner"
import { ActivityListener } from "@/components/activity-listener"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "ProNet - Professional Networking Platform",
  description: "Connect with professionals, showcase your work, and build meaningful relationships.",
  generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Suppress hydration warnings for browser extension attributes
  const suppressHydrationWarning = true;

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="font-sans" suppressHydrationWarning={suppressHydrationWarning}>
        <ActivityListener />
        <Navigation />
        {children}
        <Toaster />
      </body>
    </html>
  )
}
