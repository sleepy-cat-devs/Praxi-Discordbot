# ベースイメージとして Node.js を使用
FROM node:22-alpine

# 作業ディレクトリを設定
WORKDIR /app

# 必要なファイルをコンテナにコピー
COPY package*.json ./
COPY src/ ./
COPY .env ./
# 依存関係をインストール
RUN npm install

# プロジェクト全体をコピー
COPY . .

# TypeScriptをトランスパイル
RUN npm run build

# コンテナのデフォルトコマンドを設定
CMD ["node", "build/index.js"]