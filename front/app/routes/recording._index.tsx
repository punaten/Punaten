import { Box, Center, Flex } from "@yamada-ui/react";
import SubLogo from "~/components/global/SubLogo";
import { useRef, useState, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import DarkModeController from "~/components/global/DarkModeController";

const videoConstraints = {
  width: 360,
  height: 720,
  facingMode: "user",
};

export default function Index() {
  const videoLength = 6000;
  const setNum = 3;

  const webcamRef = useRef<Webcam>(null);
  const [capturedVideo, setCapturedVideo] = useState<string | null>(null);
  const [timeCounter, setTimeCount] = useState<number>(0);
  const [setCounter, setSetCount] = useState<number>(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [capturing, setCapturing] = useState<boolean>(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);

  const handleStartCaptureClick = useCallback(() => {
    setCapturing(true);
    setTimeCount(0);
    setSetCount(1);

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

  useEffect(() => {
    if (capturing) {
      const timeoutId = setTimeout(() => {
        setTimeCount((c) => c + 100);
      }, 100);

      if (timeCounter >= videoLength) {
        console.log("send the video");
        setSetCount((c) => c + 1);
        setTimeCount(0);
      }

      if (setCounter >= setNum + 1) {
        console.log("finish the video");
        setSetCount((c) => c + 1);
        setCapturing(false);
      }

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [timeCounter, capturing]);

  return (
    <Center bg={["cream-dark", "dark"]} h={"full"}>
      <DarkModeController />
      <SubLogo />

      <Flex>
        <Webcam
          audio={false}
          ref={webcamRef}
          videoConstraints={videoConstraints}
        />
        {capturing && !capturedVideo ? (
          <button onClick={handleStopCaptureClick}>Stop</button>
        ) : (
          <button onClick={handleStartCaptureClick}>Start</button>
        )}
        {recordedChunks.length > 0 && (
          <button onClick={handleDownload}>Download</button>
        )}
      </Flex>

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

      {capturing && <Box>{setCounter}</Box>}
    </Center>
  );
}
