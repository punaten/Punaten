# ビルドステージ
FROM python:3.10-slim AS build-stage

WORKDIR /app

# 必要なパッケージのインストール
# poetryやpipenvなど、他のパッケージマネージャーを使用する場合は適宜調整してください。
COPY requirements.txt .
RUN pip install -r requirements.txt

# アプリケーションのソースコードをコピー
COPY . .

# 本番環境用のDockerイメージ
FROM python:3.10-slim AS production-stage

WORKDIR /app

# ビルドステージから必要なファイルをコピー
COPY --from=build-stage /app /app
COPY --from=build-stage /usr/local /usr/local

# ポートの公開
EXPOSE 8080

# コンテナが起動するたびに実行されるコマンド
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
