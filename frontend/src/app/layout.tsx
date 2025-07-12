import type { Metadata } from 'next'
import '../globals.css'

export const metadata: Metadata = {
  title: 'Basketball Dashboard',
  description: 'Portal Fit Predictor - Basketball Transfer Analytics',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
