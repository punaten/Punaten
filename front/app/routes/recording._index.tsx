import { Box, Button, Center } from "@yamada-ui/react";
import { useRecording } from "~/components/detection/useRecording";
import DisplayProgresses from "~/components/recording/DisplayProgresses";
import { redirect } from "@remix-run/cloudflare";
import { ActionFunction } from "@remix-run/cloudflare";
import { Form, Link } from "@remix-run/react";

// export const action: ActionFunction = async () => {
//   const { arrayBuffer, blob } = await fetchFiles(); // データ取得

//   // ArrayBufferとBlobをBase64エンコード
//   const encodedArrayBuffer = Buffer.from(arrayBuffer).toString('base64');
//   const encodedBlob = Buffer.from(await blob.arrayBuffer()).toString('base64');

//   // リダイレクトとデータの受け渡し
//   return redirect(`/video?arrayBuffer=${encodedArrayBuffer}&blob=${encodedBlob}`);
// };

//string[]の配列をクエリに変換
const ArraytoQuery = (array: string[]) => {
  return array.map((value, index) => `array[${index}]=${value}`).join('&');
}

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
    miniPhase,
    catKind, } = useRecording();

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
          <Link to={`/video?${ArraytoQuery(catKind)}`}>動画を生成</Link>
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


