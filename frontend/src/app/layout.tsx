import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '就活管理アプリ',
  description: 'エントリーした企業の情報を整理する就活生のためのアプリ',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
