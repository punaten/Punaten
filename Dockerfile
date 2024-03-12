# Dockerfile
FROM emscripten/emsdk:latest

# Node.jsのインストール（NodeSourceから最新のLTSバージョンをインストール）
RUN curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - && \
    apt-get install -y nodejs

# ワーキングディレクトリの設定
WORKDIR /app

# Emscripten環境の初期化
RUN echo "source /emsdk/emsdk_env.sh" >> ~/.bashrc

# ポートの公開（RemixアプリとEmscriptenのサーバー用）
EXPOSE 3000 8000

# コンテナ起動時に実行されるコマンド
CMD ["bash"]
