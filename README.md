# Welcome to Remix + Vite!

📖 See the [Remix docs](https://remix.run/docs) and the [Remix Vite docs](https://remix.run/docs/en/main/future/vite) for details on supported features.

## Typegen

Generate types for your Cloudflare bindings in `wrangler.toml`:

```sh
npm run typegen
```

You will need to rerun typegen whenever you make changes to `wrangler.toml`.

## Development

Run the Vite dev server:

```sh
npm run dev
```

To run Wrangler:

```sh
npm run build
npm run start
```

## Deployment

> [!WARNING]  
> Cloudflare does _not_ use `wrangler.toml` to configure deployment bindings.
> You **MUST** [configure deployment bindings manually in the Cloudflare dashboard][bindings].

First, build your app for production:

```sh
npm run build
```

Then, deploy your app to Cloudflare Pages:

```sh
npm run deploy
```

[bindings]: https://developers.cloudflare.com/pages/functions/bindings/

Docker イメージのビルド
```sh
docker build -t remix-wasm .
```

Docker コンテナの起動

```sh
docker run -it --rm -v ${PWD}:/app -p 3000:3000 -p 8000:8000 remix-wasm
```

コンパイル

```sh
emcc app/wasm/hello.c -o app/wasm/hello.html
```

利用した推論モデル
https://github.com/tensorflow/tfjs-models/blob/master/pose-detection/src/movenet/README.md

pythonコマンド

```
python3 clustering/python/main.py
```

hello from mercy laptop

### DeploymentPages

- 骨格推定 -> `/detection`
