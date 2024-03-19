import { Pose } from "@tensorflow-models/pose-detection";
import { Box, Button, Center, Flex } from "@yamada-ui/react";
import { useRef, useState, useEffect } from "react";
import { useCamera } from "~/components/detection/useCamera";
import { usePoseDetector } from "~/components/detection/usePoseDetector";
import { useRecording } from "~/components/detection/useRecording";
import DisplayProgresses from "~/components/recording/DisplayProgresses";

export default function Index() {
  const { webcamRef, canvasRef, isDetectionOn, isCameraOn, toggleCamera, handleStartCaptureClick, handleStopCaptureClick, handleFinishRecording, handleRestartRecording, handleCancelRecording, setCounter,
    videoLength,
    setNum,
    timeCounter, } = useRecording();

  return (
    <Center bg={["cream-dark", "dark"]} h={"full"}>
      <div>
        {/* <button
          onClick={isDetectionOn ? handleStopCaptureClick : handleStartCaptureClick}
          >
          {isDetectionOn ? "Stop Detection" : "Start Detection"}
        </button> */}
        {/* <button onClick={handleDownload}>download</button> */}
        <video ref={webcamRef} style={{ display: "none" }}>
          <track kind="captions" />
        </video>
        <canvas ref={canvasRef} />
      </div>
      <div>
        <Button bg={"cinnamon"} onClick={handleStartCaptureClick}>
          撮影開始
        </Button>
        <Button bg={"cinnamon"} onClick={toggleCamera}>
          {
            isCameraOn ? "カメラを止める" : "カメラをつける"
          }
        </Button>
        <Button bg={"cinnamon"} onClick={handleFinishRecording}>
          撮影終了
        </Button>
        <Button bg={"cinnamon"} onClick={handleRestartRecording}>
          撮り直し
        </Button>
        <Button bg={"cinnamon"} onClick={handleCancelRecording}>
          キャンセル
        </Button>
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
