
# SalesBoard

**Next.js × TypeScript × PostgreSQLで開発した営業・顧客管理Webアプリケーション（CRM）**

営業現場での顧客情報、商談、活動履歴を一元的に把握することを目的とした個人開発プロジェクトです。事業運営・経営コンサルティングで得た業務知識をもとに、要件整理から画面設計、API・データベース実装、クラウド公開まで取り組んでいます。

- **公開アプリ：** https://salesboard-nextjs-app.vercel.app
- **ソースコード：** https://github.com/Kazuki-creator/salesboard
- **Next.js版の開発ブランチ：** [`feature/nextjs-migration`](https://github.com/Kazuki-creator/salesboard/tree/feature/nextjs-migration)

> **開発状況：** Next.js版をVercelで公開中。顧客管理の一覧取得・新規登録はPostgreSQLと連携済みです。商談・営業活動・ダッシュボード・レポートの完全なDB連携、顧客編集・削除、認証・権限管理は開発中です。デモ画面の数値やデータは実績を示すものではありません。

## 開発背景

営業活動では、顧客情報・商談状況・対応履歴が別々に管理されると、案件の進捗や次に取るべきアクションを把握しにくくなります。SalesBoardは、これらを一つのWebアプリケーションで管理・可視化することを目指して設計しました。法人・個人の両方を扱えるCRMを想定しています。

## 機能と実装状況

| 画面・機能 | 内容 | 現在の実装状況 |
| --- | --- | --- |
| 顧客管理 | 法人・個人の顧客一覧表示、新規登録 | **PostgreSQL連携済み（GET / POST）** |
| 顧客編集・削除 | 既存顧客の変更・削除 | 未実装 |
| 商談管理 | 商談の登録・編集・削除、ステージ管理 | 画面実装済み。ブラウザのローカル保存を使用し、顧客DBとは未連携 |
| 営業活動 | 活動の登録・編集・完了管理 | 画面実装済み。ブラウザのローカル保存を使用し、顧客・商談DBとは未連携 |
| ダッシュボード | 営業状況の概要表示 | デモデータを表示。DB集計は未実装 |
| レポート | 商談状況・売上見込みなどの可視化 | ローカル保存データ等を用いた表示。DB集計は未実装 |
| ユーザー認証 | ログイン・権限管理 | 未実装 |

※現時点では顧客・商談・活動のデータは画面横断で完全には連携していません。

## 使用技術

| 分類 | 技術 |
| --- | --- |
| フロントエンド | Next.js 16、React 19、TypeScript、CSS |
| バックエンド | Next.js Route Handlers（REST API） |
| ORM | Prisma 7、`@prisma/adapter-pg` |
| データベース | PostgreSQL |
| ローカル開発 | Node.js、Docker / Docker Compose |
| クラウドDB | Neon（PostgreSQL） |
| ホスティング | Vercel |
| バージョン管理 | Git / GitHub |

React・Viteで制作したアプリをベースに、Next.jsへの移行とAPI・DB連携を進めています。

## システム構成

```text
ブラウザ
  └─ Next.js / React（画面）
       └─ Next.js Route Handlers（/api/customers）
            └─ Prisma ORM + PostgreSQL adapter
                 └─ PostgreSQL
                      ├─ ローカル開発：Docker
                      └─ 公開環境：Neon

GitHub（ソースコード） → Vercel（ビルド・ホスティング）
```

公開環境では、Vercelに登録した環境変数 `DATABASE_URL` を使ってNeonに接続します。データベースの認証情報や `.env` ファイルはGitで管理しません。

## 実装で取り組んだこと

- 事業運営での課題をもとにしたCRMの機能・画面設計
- React・TypeScriptでの複数画面の実装とNext.jsへの移行
- Next.js Route Handlersによる顧客一覧取得・登録APIの実装
- Prismaによるデータモデル定義とマイグレーション管理
- Docker上のPostgreSQLを用いたローカル開発
- Neonへのマイグレーション適用とVercelでの公開
- 公開環境での顧客登録と再読み込み後のデータ保持の動作確認

## ローカルでの起動（Next.js版）

### 前提

- Node.js / npm
- Docker Desktop / Docker Compose
- PostgreSQLへの接続情報

### 起動手順

```bash
# リポジトリを取得
git clone https://github.com/Kazuki-creator/salesboard.git
cd salesboard
git switch feature/nextjs-migration

# ローカルDBを起動（リポジトリ直下）
docker compose up -d

# Next.jsアプリの準備
cd nextjs-app
npm install
```

`nextjs-app/.env` にローカルPostgreSQLの接続URLを設定します（値は自身のDocker Compose設定に合わせてください）。

```dotenv
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/<database>"
```

続けて以下を実行します。

```bash
npx prisma migrate deploy --config ./prisma7.config.ts
npx prisma generate --config ./prisma7.config.ts
npm run dev
```

ブラウザで `http://localhost:3000` を開きます。顧客APIの動作確認は `http://localhost:3000/api/customers` から行えます。

> 本番DBのURLをローカル環境へ不用意に設定しないでください。環境変数の値と実行対象のDBを確認してからマイグレーションを行ってください。

## 今後の開発予定

1. 顧客編集・削除のAPI連携
2. `Customer.id`を用いた顧客・商談・営業活動の関連付けとDB保存
3. 商談・活動データに基づくダッシュボード・レポート集計
4. ユーザー認証・アクセス制御
5. テスト・エラーハンドリング・運用面の整備

## 注意事項

本アプリはポートフォリオとして公開している開発中のデモです。**ログイン・権限管理は未実装**のため、個人情報・機密情報・実在顧客の情報は登録しないでください。動作確認には架空データのみを使用してください。

## 開発者

個人開発（企画、設計、実装、デプロイ）
