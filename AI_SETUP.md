# AI 自動入力機能のセットアップ方法

企業名を入力するだけで、AIが業界・職種・勤務地・初任給・企業URLなどを自動で提案してくれる機能を追加しました！

## 🎯 機能概要

- **企業名入力後**、「🤖 AI自動入力」ボタンをクリック
- AIが企業情報を推測して自動入力
- 業界、職種、勤務地、初任給、企業URLを自動取得
- **完全無料**で利用可能（Google Gemini API使用）

## 📝 セットアップ手順

### 1. Google Gemini API キーを取得（無料）

1. [Google AI Studio](https://makersuite.google.com/app/apikey) にアクセス
2. Googleアカウントでログイン
3. 「Get API Key」または「APIキーを作成」をクリック
4. 新しいプロジェクトでAPIキーを作成
5. 生成されたAPIキーをコピー

### 2. APIキーを設定

`backend/.env` ファイルを開いて、以下のようにAPIキーを設定：

```env
GEMINI_API_KEY=あなたのAPIキーをここに貼り付け
```

例：
```env
GEMINI_API_KEY=AIzaSyABCDEFGHIJKLMNOPQRSTUVWXYZ1234567
```

### 3. 必要なパッケージをインストール

#### バックエンド（Python）

```powershell
cd backend
pip install -r requirements.txt
```

新しく追加されたパッケージ：
- `google-generativeai`: Google Gemini API のライブラリ
- `python-dotenv`: 環境変数の管理

### 4. サーバーを再起動

#### バックエンドサーバー

```powershell
cd backend
python main.py
```

#### フロントエンドサーバー

```powershell
cd frontend
npm run dev
```

## 🚀 使い方

### 企業追加画面で使用

1. 企業追加画面 (`http://localhost:3000/companies/new`) を開く
2. 「企業名」フィールドに企業名を入力（例：トヨタ自動車）
3. 「🤖 AI自動入力」ボタンをクリック
4. 数秒待つと、以下の情報が自動入力されます：
   - 業界
   - 職種
   - 勤務地
   - 初任給
   - 企業サイトURL
5. 内容を確認・修正して「登録する」

### 企業編集画面でも使用可能

企業編集画面でも同様に「🤖 AI自動入力」ボタンが使えます。

## 💡 利用制限

- **Google Gemini API（無料枠）**
  - 月間60リクエスト/分まで無料
  - 通常の就活管理なら十分な量
  - 制限を超えると翌月まで待つ必要あり

## ⚠️ トラブルシューティング

### 「AI サービスが利用できません」と表示される

→ `backend/.env` ファイルに `GEMINI_API_KEY` が正しく設定されているか確認

### 「AI による自動入力に失敗しました」と表示される

1. バックエンドサーバーが起動しているか確認
2. APIキーが有効か確認
3. インターネット接続を確認

### パッケージのインストールエラー

```powershell
# Pythonのバージョンを確認（3.8以上推奨）
python --version

# pipを最新版に更新
python -m pip install --upgrade pip

# 再度インストール
pip install -r requirements.txt
```

## 🎨 カスタマイズ

### AIの提案内容を変更したい場合

`backend/ai_service.py` の `prompt` を編集してください。

例：より詳細な情報を取得したい場合は、プロンプトに追加の項目を指定できます。

## 📊 コスト（参考）

- **Google Gemini API**: 完全無料（月間制限内）
- 追加コスト: なし

## 🔒 セキュリティ

- `.env` ファイルは `.gitignore` に追加済み（GitHubにアップロードされない）
- APIキーは絶対に公開しないでください

## 📚 参考リンク

- [Google AI Studio](https://makersuite.google.com/)
- [Gemini API ドキュメント](https://ai.google.dev/docs)
