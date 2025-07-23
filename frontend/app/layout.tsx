import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Spatial Understanding',
  description: 'AI-powered spatial understanding and computer vision',
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