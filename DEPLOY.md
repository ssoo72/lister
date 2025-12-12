# Renderへのデプロイ手順

このアプリケーションをRenderにデプロイする方法を説明します。

## 前提条件

1. [Render](https://render.com/)のアカウントを作成
2. GitHubリポジトリにコードをプッシュ
3. Google Gemini APIキーを取得済み

## デプロイ方法

### オプション1: render.yaml を使用した自動デプロイ（推奨）

1. **Renderダッシュボードにアクセス**
   - https://dashboard.render.com/ にログイン

2. **Blueprint から新規作成**
   - "New" → "Blueprint" をクリック
   - GitHubリポジトリを接続
   - `render.yaml` が自動検出されます

3. **環境変数の設定**
   - バックエンドサービスで `GEMINI_API_KEY` を設定
   - Renderのダッシュボードで Environment タブから設定

4. **デプロイ**
   - "Apply" をクリックしてデプロイ開始
   - バックエンドとフロントエンドが自動的にデプロイされます

### オプション2: 個別にサービスを作成

#### バックエンドのデプロイ

1. **新しい Web Service を作成**
   - "New" → "Web Service" をクリック
   - GitHubリポジトリを選択

2. **設定**
   ```
   Name: lister-backend
   Region: Oregon (or your preferred)
   Branch: main (or your branch)
   Root Directory: (空欄)
   Environment: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

3. **環境変数**
   - `GEMINI_API_KEY`: あなたのGemini APIキー

4. **デプロイ**
   - "Create Web Service" をクリック

#### フロントエンドのデプロイ

1. **新しい Web Service を作成**
   - "New" → "Web Service" をクリック
   - 同じGitHubリポジトリを選択

2. **設定**
   ```
   Name: lister-frontend
   Region: Oregon (or your preferred)
   Branch: main (or your branch)
   Root Directory: frontend
   Environment: Node
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

3. **環境変数**
   - `NEXT_PUBLIC_API_URL`: バックエンドのURL（例: https://lister-backend.onrender.com）

4. **デプロイ**
   - "Create Web Service" をクリック

## デプロイ後の確認

1. **バックエンド**
   - `https://your-backend.onrender.com/` にアクセス
   - `{"message":"就活管理API"}` が表示されることを確認

2. **フロントエンド**
   - `https://your-frontend.onrender.com/` にアクセス
   - アプリケーションが正常に動作することを確認

## データベースについて

現在はSQLiteを使用しています。本番環境では以下のオプションがあります：

### オプション1: SQLite（現在の設定）
- ファイルベースなので追加設定不要
- 小規模アプリケーションに適している
- Renderの無料プランでも動作

### オプション2: PostgreSQLへ移行（推奨）
より堅牢なデータベースが必要な場合：

1. Renderで PostgreSQL データベースを作成
2. `requirements.txt` に `psycopg2-binary` を追加
3. `backend/database.py` を更新してPostgreSQLに接続

## 注意事項

- **無料プラン**: Renderの無料プランでは、15分間アクセスがないとサービスがスリープします
- **環境変数**: `.env` ファイルはGitHubにプッシュしないでください
- **CORS設定**: `backend/main.py` のCORS設定にフロントエンドのURLを追加してください

## トラブルシューティング

### ビルドエラー
- ログを確認して依存関係が正しくインストールされているか確認
- Python/Nodeのバージョンが正しいか確認

### 接続エラー
- フロントエンドの `NEXT_PUBLIC_API_URL` が正しく設定されているか確認
- バックエンドのCORS設定にフロントエンドのURLが含まれているか確認

### データベースエラー
- SQLiteファイルのパーミッションを確認
- ログを確認してデータベースの初期化が成功しているか確認

## 更新方法

GitHubリポジトリにプッシュすると、Renderが自動的に再デプロイします。

```bash
git add .
git commit -m "Update application"
git push origin main
```
