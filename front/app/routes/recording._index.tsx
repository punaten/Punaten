import { Center, Flex, Link, Motion } from "@yamada-ui/react";
import DarkModeController from "~/components/global/DarkModeController";
import SubLogo from "~/components/global/SubLogo";
import { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";

const videoConstraints = {
  width: 360,
  height: 720,
  facingMode: "user",
};

export default function Index() {
  const [isCaptureEnable, setCaptureEnable] = useState<boolean>(false);
  const webcamRef = useRef<Webcam>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [capturedVideo, setCapturedVideo] = useState<string | null>(null);
  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setUrl(imageSrc);
    }
  }, [webcamRef]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [capturing, setCapturing] = useState<boolean>(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);

  const handleStartCaptureClick = useCallback(() => {
    setCapturing(true);
    if (webcamRef.current) {
      mediaRecorderRef.current = new MediaRecorder(
        webcamRef.current.stream as MediaStream,
        {
          mimeType: "video/webm",
        }
      );
      mediaRecorderRef.current.addEventListener(
        "dataavailable",
        handleDataAvailable
      );
      mediaRecorderRef.current.start();
    }
  }, [webcamRef, setCapturing, mediaRecorderRef]);

  const handleDataAvailable = useCallback(
    ({ data }: { data: Blob }) => {
      if (data.size > 0) {
        setRecordedChunks((prev) => [...prev, data]);
      }
    },
    [setRecordedChunks]
  );

  const handleStopCaptureClick = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    setCapturing(false);
  }, [mediaRecorderRef, setCapturing]);

  const handleDownload = useCallback(() => {
    if (recordedChunks.length) {
      const blob = new Blob(recordedChunks, {
        type: "video/webm",
      });
      const url = URL.createObjectURL(blob);
      setCapturedVideo(url);
      setRecordedChunks([]);
    }
  }, [recordedChunks]);

  return (
    <Center bg={["cream-dark", "dark"]} h={"full"}>
      {/* <DarkModeController /> */}
      <SubLogo />
      <header>
        <h1>カメラアプリ</h1>
      </header>
      {isCaptureEnable || (
        <button onClick={() => setCaptureEnable(true)}>開始</button>
      )}
      {isCaptureEnable && (
        <>
          <div>
            <button onClick={() => setCaptureEnable(false)}>終了</button>
          </div>
          <div>
            <Webcam
              audio={false}
              ref={webcamRef}
              videoConstraints={videoConstraints}
            />
            {capturing && !capturedVideo ? (
              <button onClick={handleStopCaptureClick}>Stop Capture</button>
            ) : (
              <button onClick={handleStartCaptureClick}>Start Capture</button>
            )}
            {recordedChunks.length > 0 && (
              <button onClick={handleDownload}>Download</button>
            )}
          </div>

          {capturedVideo && (
            <video controls width="250">
              <source src={capturedVideo} type="video/webm" />
              <source src="/media/cc0-videos/flower.mp4" type="video/mp4" />
              Download the
              <a href={capturedVideo}>WEBM</a>
              or
              <a href="/media/cc0-videos/flower.mp4">MP4</a>
              video.
            </video>
          )}

          <button onClick={capture}>キャプチャ</button>
        </>
      )}
      {url && (
        <>
          <div>
            <button
              onClick={() => {
                setUrl(null);
              }}
            >
              削除
            </button>
          </div>
          <div>
            <img src={url} alt="Screenshot" />
          </div>
        </>
      )}
    </Center>
  );
}
