import { Box, Button, Center } from "@yamada-ui/react";
import { useRecording } from "~/components/detection/useRecording";
import DisplayProgresses from "~/components/recording/DisplayProgresses";
import { redirect } from "@remix-run/cloudflare";
import { ActionFunction } from "@remix-run/cloudflare";
import { Form } from "@remix-run/react";

export const action: ActionFunction = async () => {
  const { arrayBuffer, blob } = await fetchFiles(); // データ取得

  // ArrayBufferとBlobをBase64エンコード
  const encodedArrayBuffer = Buffer.from(arrayBuffer).toString('base64');
  const encodedBlob = Buffer.from(await blob.arrayBuffer()).toString('base64');

  // リダイレクトとデータの受け渡し
  return redirect(`/video?arrayBuffer=${encodedArrayBuffer}&blob=${encodedBlob}`);
};

export default function Index() {
  const { webcamRef,
    canvasRef,
    isDetectionOn,
    isCameraOn,
    videoLength,
    setNum,
    timeCounter,
    startRecording,
    restartRecording,
    cancelRecording,
    finishRecording,
    remainingTime,
    phase,
    miniPhase } = useRecording();

  return (
    <div>
      <Center>
        <video ref={webcamRef} style={{ display: "none" }}>
          <track kind="captions" />
        </video>
        <canvas
          ref={canvasRef}
          style={{
            width: "40rem",
            height: "30rem",
            visibility: miniPhase === 0 ? "hidden" : "visible"
          }}
        />
      </Center>
      <Center as="div" bg={["cream-dark", "dark"]} minH={"5rem"} p={"2rem"} display={"block"}>
        <div style={{ width: "fit-content", margin: "auto" }}>
          <Button bg={"cinnamon"} onClick={startRecording}>
            録画開始
          </Button>
          <Button bg={"cinnamon"} onClick={restartRecording}>
            録り直し
          </Button>
          <Button bg={"cinnamon"} onClick={cancelRecording}>
            キャンセル
          </Button>
          <Button bg={"cinnamon"} onClick={finishRecording}>
            録画終了
          </Button>
        </div>
        <DisplayProgresses
          currentTimer={videoLength - remainingTime * 2}
          videoLength={videoLength}
          currentSet={phase}
          setNum={setNum}
        />
      </Center>
      <Box>
        phase{phase}
      </Box>
      <Box>
        miniphase;{miniPhase}
      </Box>
      <Box>
        {remainingTime}
      </Box>
      <Form method="post">
            <button type="submit">Submit</button>
        </Form>
      {/* <Box>
        {phase}:{timeCounter}
      </Box> */}
    </div>
  );
}

const fetchFiles = async () => {
  // ランダムに動画ファイル名を複数選択（ここでは仮に1つだけ選択しています）
  const fileSrc = ["edm", "Girlfriend", "happy_happy", "shikarareru", "yonezu_happy"];
  let suffix = "";
  let mp3Suffix = "";
  for (let i = 0; i < 4; i++) {
      const videoAndAudioFileName = fileSrc[Math.floor(Math.random() * fileSrc.length)];

      // 動画ファイル名をAPIに送信するための形式に整形
      const videoSrc = videoAndAudioFileName + ".mp4"; // ここでは1つのファイル名を使用
      const mp3Src = videoAndAudioFileName + ".mp3";
      suffix += "/" + videoSrc;
      mp3Suffix += "/" + mp3Src;
  }

  // APIリクエストの送信
  const response = await fetch('https://punaten-video-uvb7exztca-an.a.run.app/combine' + suffix, {
      method: 'GET', // GETメソッドを使用
  });

  const res = await fetch("https://punaten-video-uvb7exztca-an.a.run.app/combine/mp3" + mp3Suffix, {
      method: 'GET', // GETメソッドを使用
  });

  // レスポンスを検証
  if (response.ok && res.ok) {
      const blob = await response.blob(); // レスポンスをBlobとして取得
      const arrayBuffer = await res.arrayBuffer(); // レスポンスをArrayBufferとして取得
      return { blob, arrayBuffer };
  } else {
      throw new Error('Failed to fetch files');
  }
};
