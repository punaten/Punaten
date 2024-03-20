import { useSearchParams } from "@remix-run/react";
import {
  Box,
  Button,
  Center,
  Modal,
  ModalBody,
  ModalHeader,
  ModalOverlay,
  Wrap,
  useDisclosure,
} from "@yamada-ui/react";
import React, { useEffect, useRef, useState } from "react";

function App() {
  const [fileSrc, setFileSrc] = useState<string[]>([
    "edm",
    "Girlfriend",
    "happy_happy",
    "shikarareru",
    "yonezu_happy",
  ]);

  const [backgroundSrc, setBackgroundSrc] = useState<string>("");
  const isImageSelected = backgroundSrc !== "";
  const [isLoading, setLoading] = useState<boolean>(false);
  const [blobData, setBlobData] = useState<Blob>();
  const canvasRef = useRef<HTMLCanvasElement>(null); // canvasへの参照
  const videoRef = useRef<HTMLVideoElement>(null); // videoタグへの参照を追加
  const [fetchVideoURL, setFetchVideoURL] = useState<string>("");
  const [downloadUrl, setDownloadUrl] = useState<string>(""); // ダウンロード用のURL
  const recordedChunksRef = useRef<Blob[]>([]);
  // MP3データを保存するためのuseState
  const [audioData, setAudioData] = useState<ArrayBuffer>();

  const [searchParams] = useSearchParams();
  // const [ arrayValues, setArrayValues ] = useState<string[]>([]);
  const arrayValues: string[] = [];

  // クエリパラメータから配列を取得
  for (const [key, value] of searchParams.entries()) {
    if (key.startsWith("array[")) {
      arrayValues.push(value);
    }
  }

  //useEffectで初回ロード時にfetchFilesを実行
  useEffect(() => {
    fetchFiles();
  }, []);

  const handleBackgroundFile = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    setBackgroundSrc(URL.createObjectURL(file));
  };

  const createChromaKeyComposite = async () => {
    debugger;
    if (!canvasRef.current || !videoRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setLoading(true);

    // 背景画像をロード
    const background = new Image();
    background.src = backgroundSrc;
    await new Promise((resolve) => {
      background.onload = () => {
        canvas.width = background.width;
        canvas.height = background.height;
        ctx.drawImage(background, 0, 0);
        resolve(true);
      };
    });

    // video要素を設定
    const video = document.createElement("video");
    video.src = fetchVideoURL;
    video.muted = true;
    video.autoplay = true;
    await new Promise((resolve) => {
      video.onloadedmetadata = () => resolve(true);
    });

    // Audio setup
    const audioContext = new AudioContext();
    // const audioData = await fetch("/public/" + "edm" + ".mp3").then(response => response.arrayBuffer());
    if (!audioData) return;
    const decodedAudioData = await audioContext.decodeAudioData(audioData);
    const audioSource = audioContext.createBufferSource();
    audioSource.buffer = decodedAudioData;
    const destination = audioContext.createMediaStreamDestination();
    audioSource.connect(destination);
    audioSource.start(0); // オーディオの再生を開始

    // 背景画像のピクセルデータを取得
    const bgFrame = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const bgData = bgFrame.data;

    const draw = () => {
      if (video.paused || video.ended) {
        setLoading(false);
        mediaRecorder.stop();
        return;
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      let frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const l = frame.data.length / 4;

      for (let i = 0; i < l; i++) {
        const r = frame.data[i * 4 + 0];
        const g = frame.data[i * 4 + 1];
        const b = frame.data[i * 4 + 2];
        // 緑色のピクセルを背景画像のピクセルで置き換える
        if (g > 100 && r < 100 && b < 100) {
          frame.data[i * 4 + 0] = bgData[i * 4 + 0];
          frame.data[i * 4 + 1] = bgData[i * 4 + 1];
          frame.data[i * 4 + 2] = bgData[i * 4 + 2];
        }
      }

      ctx.putImageData(frame, 0, 0);
      requestAnimationFrame(draw);
    };

    // オーディオとビデオの準備ができた後
    const audioStream = destination.stream; // オーディオストリームを取得
    const videoStream = canvas.captureStream(25); // 25fpsでキャンバスからビデオストリームを取得

    const audioTrack = destination.stream.getAudioTracks()[0]; // 音声トラックを取得

    const ms = new MediaStream([...videoStream.getVideoTracks(), audioTrack]);
    const mediaRecorder = new MediaRecorder(ms);

    mediaRecorder.ondataavailable = (event: BlobEvent) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      console.log("recorder stopped");
      const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      setBlobData(blob);
      setDownloadUrl(url);
      recordedChunksRef.current = [];
      setLoading(false);
    };

    video.play().then(() => {
      requestAnimationFrame(draw);
      mediaRecorder.start();
    });

    // videoRefが参照するビデオ要素にストリームを設定
    if (videoRef.current) {
      videoRef.current.srcObject = new MediaStream([
        ...videoStream.getVideoTracks(),
        ...audioStream.getAudioTracks(),
      ]);
      videoRef.current
        .play()
        .catch((error) => console.error("Video play failed", error));
    }
  };

  const handleClickGenerate = () => {
    if (!backgroundSrc) {
      alert("背景画像を選択してください");
      return;
    }
    createChromaKeyComposite();
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = "canvas-animation.webm";
    a.click();
    URL.revokeObjectURL(downloadUrl);
  };

  const handleUploadVideo = () => {
    // FormData オブジェクトの作成
    const formData = new FormData();

    // FormData に Blob を追加 (ファイルとして)
    // 第一引数の 'file' はサーバー側でのファイル受け取りキーとなる
    if (!blobData) return;
    formData.append("file", blobData, "video.webm");
    // API エンドポイントへの POST リクエスト
    // 'API_ENDPOINT' は実際のAPIのURLに置き換えてください
    fetch("https://punaten-uvb7exztca-an.a.run.app/upload", {
      method: "POST",
      body: formData,
      // 'Content-Type': 'multipart/form-data' ヘッダーは自動で設定されるため、明示的に追加する必要はありません
    })
      .then((response) => response.json()) // レスポンスの JSON を解析
      .then((data) => {
        console.log("Success:", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const fetchFiles = async () => {
    // ランダムに動画ファイル名を複数選択（ここでは仮に1つだけ選択しています）
    const fileSrc = [
      "edm",
      "Girlfriend",
      "happy_happy",
      "shikarareru",
      "yonezu_happy",
    ];
    let suffix = "";
    let mp3Suffix = "";
    arrayValues.forEach((value) => {
      suffix += "/" + value + ".mp4";
      mp3Suffix += "/" + value + ".mp3";
    });

    // APIリクエストの送信
    const response = await fetch(
      "https://punaten-video-uvb7exztca-an.a.run.app/combine" + suffix,
      {
        method: "GET", // GETメソッドを使用
      }
    );

    const res = await fetch(
      "https://punaten-video-uvb7exztca-an.a.run.app/combine/mp3" + mp3Suffix,
      {
        method: "GET", // GETメソッドを使用
      }
    );

    // レスポンスをArrayBufferとして取得
    const data = await res.arrayBuffer();
    // 取得したArrayBufferを状態に保存
    setAudioData(data);

    console.log(response);
    if (response.ok) {
      const blob = await response.blob(); // レスポンスをBlobとして取得
      const videoURL = URL.createObjectURL(blob); // BlobからURLを生成
      setFetchVideoURL(videoURL); // video要素のsrcに設定
    } else {
      console.error("Failed to fetch video");
    }
  };

  const { onClose } = useDisclosure();

  return (
    <Box>
      <Modal
        isOpen={!isImageSelected}
        onClose={onClose}
        size={"2xl"}
        withCloseButton={false}
        p={8}
      >
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalHeader>背景画像を選択してください</ModalHeader>
        <ModalBody>
          <Center py={8}>
            <input
              type="file"
              accept="image/*"
              onChange={handleBackgroundFile}
            />
          </Center>
        </ModalBody>
      </Modal>
      <h1>猫ミーム no 動画生成</h1>
      {/* <Button onClick={handleFetchClick}>fetch</Button> */}
      {fetchVideoURL}
      <button onClick={handleClickGenerate}>動画をつくる</button>
      <canvas ref={canvasRef} style={{ display: "none" }}></canvas>{" "}
      {/* canvasを非表示に */}
      <video
        ref={videoRef}
        controls
        autoPlay
        style={{ maxWidth: "80dvw", maxHeight: "80dvh" }}
      ></video>{" "}
      {/* video要素を追加 */}
      {/* <video src={downloadUrl} controls style={{ maxWidth: '100%' }}></video> video要素を追加 */}
      {downloadUrl && (
        <Button onClick={handleDownload}>動画をダウンロード</Button>
      )}
      {downloadUrl && (
        <Button onClick={handleUploadVideo}>タイムラインにアップロード</Button>
      )}
      <Button onClick={() => setBackgroundSrc("")}>画像を変更する</Button>
    </Box>
  );
}

export default App;
