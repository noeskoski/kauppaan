import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Kauppaan — ostoslista',
  description: 'Pidä kauppareissun ostokset helposti tallessa.',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="fi">
      <body>{children}</body>
    </html>
  )
}
