import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: 'E-Cell Forms',
  description: 'Dynamic form builder and management system for E-Cell',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/jpeg" href="/ECellfavicon.jpg" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        {children}
        <Analytics />
        <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
      </body>
    </html>
  )
}
