import type { Metadata } from 'next'
import '../globals.css'

export const metadata: Metadata = {
  title: 'Illini Fit',
  description: 'Portal Fit Predictor',
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
