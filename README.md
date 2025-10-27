# 就活管理アプリ

エントリーした企業の情報を整理する就活生のためのWEBアプリケーションです。

## 技術スタック

- **バックエンド**: FastAPI (Python)
- **フロントエンド**: Next.js (React, TypeScript)
- **データベース**: SQLite

## 機能

- 企業情報の登録・編集・削除
- 選考状況の管理（エントリー済み、書類選考中、面接中、内定、不合格）
- ES締切日・面接日程の管理
- 企業メモ・面接メモの保存
- 優先度の設定
- フィルタリング・ソート機能
- レスポンシブデザイン

## セットアップ

### バックエンド（FastAPI）

1. 必要なパッケージをインストール:
```powershell
cd lister
pip install -r requirements.txt
```

2. FastAPIサーバーを起動:
```powershell
cd backend
python main.py
```

サーバーは `http://localhost:8000` で起動します。
API ドキュメントは `http://localhost:8000/docs` で確認できます。

### フロントエンド（Next.js）

1. Node.jsパッケージをインストール:
```powershell
cd frontend
npm install
```

2. 開発サーバーを起動:
```powershell
npm run dev
```

アプリは `http://localhost:3000` で起動します。

## プロジェクト構造

```
lister/
├── backend/               # FastAPIバックエンド
│   ├── __init__.py
│   ├── main.py            # FastAPIアプリケーション
│   ├── models.py          # データベースモデル
│   ├── crud.py            # CRUD操作
│   └── database.py        # データベース接続
├── frontend/              # Next.jsフロントエンド
│   ├── src/
│   │   ├── app/          # App Router
│   │   │   ├── page.tsx  # トップページ（企業一覧）
│   │   │   ├── companies/
│   │   │   │   ├── new/  # 企業追加ページ
│   │   │   │   └── [id]/ # 企業詳細・編集ページ
│   │   │   └── globals.css
│   │   └── lib/
│   │       └── api.ts     # API通信
│   ├── package.json
│   ├── tsconfig.json
│   └── next.config.js
├── requirements.txt       # Python依存関係
└── job_hunting.db        # SQLiteデータベース（自動生成）
```

## API エンドポイント

- `GET /companies/` - 企業一覧を取得
- `GET /companies/{id}` - 特定の企業を取得
- `POST /companies/` - 企業を登録
- `PUT /companies/{id}` - 企業情報を更新
- `DELETE /companies/{id}` - 企業を削除
- `GET /companies/search/?keyword=` - 企業名で検索
- `GET /statistics/` - 統計情報を取得

## 使い方

1. トップページで「+ 企業を追加」をクリック
2. 企業情報を入力して登録
3. 企業カードをクリックして詳細を確認
4. 編集ボタンで情報を更新
5. フィルターやソート機能で企業を整理

## 開発

### バックエンドの開発
```powershell
cd lister/backend
uvicorn main:app --reload
```

### フロントエンドの開発
```powershell
cd lister/frontend
npm run dev
```

## 本番ビルド

### フロントエンド
```powershell
cd frontend
npm run build
npm start
```

## ライセンス

MIT License


lllll
