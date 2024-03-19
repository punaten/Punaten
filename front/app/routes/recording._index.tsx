import { Pose } from "@tensorflow-models/pose-detection";
import { Box, Button, Center, Flex } from "@yamada-ui/react";
import { useRef, useState, useEffect } from "react";
import { useCamera } from "~/components/detection/useCamera";
import { usePoseDetector } from "~/components/detection/usePoseDetector";
import DisplayProgresses from "~/components/recording/DisplayProgresses";

export default function Index() {
  const videoLength = 6000;
  const setNum = 3;

  const [timeCounter, setTimeCount] = useState<number>(-3000);
  const [setCounter, setSetCount] = useState<number>(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isCameraOn } = useCamera(videoRef);
  const {
    isDetectionOn,
    detectedPoses,
    handleStartDetection,
    handleStopDetection,
  } = usePoseDetector(videoRef, canvasRef, isCameraOn);

  useEffect(() => {
    if (isDetectionOn) {
      const timeoutId = setTimeout(() => {
        setTimeCount((c) => c + 500);
      }, 500);

      if (timeCounter >= videoLength) {
        handleStopDetection();
        handleDownload(detectedPoses);
        setSetCount((c) => c + 1);
        setTimeCount(-3000);
      }

      return () => {
        clearTimeout(timeoutId);
      };
    } else if (setCounter !== 0 && setCounter <= setNum) {
      const timeoutId = setTimeout(() => {
        setTimeCount((c) => c + 500);
      }, 500);

      if (timeCounter >= 0) {
        handleStartDetection();
      }

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [timeCounter, setCounter, isDetectionOn]);

  const handleStartCapturing = () => {
    setSetCount(1);
  };

  const handleDownload = (poses: Pose[][]) => {
    console.log(poses);
  };

  return (
    <Center bg={["cream-dark", "dark"]} h={"full"}>
      <Button bg={"cinnamon"} onClick={handleStartCapturing}>
        Start
      </Button>
      <div>
        <button
          onClick={isDetectionOn ? handleStopDetection : handleStartDetection}
        >
          {isDetectionOn ? "Stop Detection" : "Start Detection"}
        </button>
        {/* <button onClick={handleDownload}>download</button> */}
        <video ref={videoRef} style={{ display: "none" }}>
          <track kind="captions" />
        </video>
        <canvas ref={canvasRef} />
      </div>

      <DisplayProgresses
        currentTimer={timeCounter}
        videoLength={videoLength}
        currentSet={setCounter}
        setNum={setNum}
      />
      <Box>
        {setCounter}:{timeCounter}
      </Box>
    </Center>
  );
}
