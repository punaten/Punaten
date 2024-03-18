# Dockerfile
FROM emscripten/emsdk:3.1.56

# Node.jsとPythonのインストール
RUN curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - && \
    apt-get install -y nodejs python3 python3-pip libgl1-mesa-glx

# ワーキングディレクトリの設定
WORKDIR /app

# pythonのパッケージのインストール
COPY clustering/python/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Emscripten環境の初期化
RUN echo "source /emsdk/emsdk_env.sh" >> ~/.bashrc

# ポートの公開（RemixアプリとEmscriptenのサーバー用）
EXPOSE 3000 8000

# コンテナ起動時に実行されるコマンド
CMD ["bash"]
