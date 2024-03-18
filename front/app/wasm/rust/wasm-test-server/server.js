const express = require('express');
const app = express();
const port = 3000;

// クロスオリジンポリシーヘッダーを設定するミドルウェア
// app.use((req, res, next) => {
//   res.header('Cross-Origin-Embedder-Policy', 'require-corp');
//   res.header('Cross-Origin-Opener-Policy', 'same-origin');
//   next();
// });

// 静的ファ

// 静的ファイルの配信設定
app.use(express.static('public'));

// ルートエンドポイント
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
