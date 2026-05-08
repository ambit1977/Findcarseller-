# Findcarseller

ヤフオク・ジモティーから特定車種の中古車出品を定期巡回し、Web UI でまとめて確認するアプリ。

## 機能 (MVP)

- 検索条件の保存 (ソース・キーワード・価格レンジ・地域)
- ソースアダプタ: ヤフオクRSS / ジモティーHTML
- 15分毎の Vercel Cron 巡回 + 手動「今すぐ巡回」
- 新着フィード (NEWバッジ + 既読管理)

## 構成

- Next.js 15 App Router + TypeScript + Tailwind
- Drizzle ORM + Neon Postgres
- Vercel Cron で `/api/cron/poll` を定期実行

## ローカル開発

```sh
npm install
cp .env.example .env.local
# .env.local の DATABASE_URL に Neon の接続文字列を入れる
npm run db:push
npm run dev
```

## Vercel デプロイ

1. GitHub リポジトリを Vercel にインポート
2. Storage > Neon を有効化 (`DATABASE_URL` が自動で入る)
3. Environment Variables で `CRON_SECRET` を設定 (Vercel Cron はこの値を `Authorization: Bearer ...` で送信)
4. デプロイ後、`vercel.json` の crons が自動登録される
5. 初回はダッシュボードから「今すぐ巡回」を押して動作確認

## 各ソースの注意

### ヤフオク
- `auccat=26318` (自動車本体) を既定にしています。バイクや部品など別カテゴリを使いたい場合は検索条件の「追加クエリ」に `auccat=...` を渡してください
- RSS のレスポンスが将来変わる可能性あり。`src/lib/adapters/yahoo-auctions.ts` のパーサを調整

### ジモティー (jmty)
- `area` フィールドに都道府県スラッグ (`tokyo`, `osaka`, `all` など) を入れてください
- HTML スクレイピングのため、サイト改修でセレクタが効かなくなることがあります。`src/lib/adapters/jmty.ts` の `cards` セレクタを優先順に並べてあるので追記して対応してください
- Vercel の egress IP がブロックされた場合、UA を変える / 巡回間隔を伸ばす / 別ホスティング検討

## 拡張の足場

- メルカリ系を追加する場合は `src/lib/adapters/` に新しいアダプタを足し、`src/db/schema.ts` の `sources` 配列に追加
- 通知チャネル (Discord webhook 等) は `src/lib/poll.ts` の `inserted > 0` 分岐に hook ポイントを追加すれば実装可能

## ライセンス

Private / unlicensed.
