import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Findcarseller - 中古車マーケット横断検索",
  description: "ヤフオクとジモティーから特定車種の出品を定期巡回",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <header className="border-b border-neutral-200 dark:border-neutral-800">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-lg font-semibold">
              Findcarseller
            </Link>
            <div className="flex gap-3 text-sm">
              <Link href="/" className="hover:underline">
                ダッシュボード
              </Link>
              <Link href="/searches/new" className="hover:underline">
                検索条件を追加
              </Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
