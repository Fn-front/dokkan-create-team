import type { Metadata } from 'next'
import { Noto_Sans_JP } from 'next/font/google'
import '../styles/globals.css'
import '../styles/reset.css'

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ドッカンバトル チーム作成ツール',
  description:
    'ドラゴンボールZ ドッカンバトルの最適なチーム編成を作成するためのツールです。',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body className={notoSansJP.className}>{children}</body>
    </html>
  )
}
