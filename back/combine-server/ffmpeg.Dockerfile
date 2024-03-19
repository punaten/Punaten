    # ビルドステージ
    FROM python:3.10-slim AS build-stage

    WORKDIR /app

    # FFmpegのインストール
    RUN apt-get update && \
        apt-get install -y ffmpeg && \
        rm -rf /var/lib/apt/lists/*
