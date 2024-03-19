import { Pose } from "@tensorflow-models/pose-detection";
import { Box, Button, Center, Flex } from "@yamada-ui/react";
import { useRef, useState, useEffect } from "react";
import { useCamera } from "~/components/detection/useCamera";
import { usePoseDetector } from "~/components/detection/usePoseDetector";
import { useRecording } from "~/components/detection/useRecording";
import DisplayProgresses from "~/components/recording/DisplayProgresses";

export default function Index() {
  const { videoRef,
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
        <video ref={videoRef} style={{ display: "none" }}>
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
      {/* <Box>
        {phase}:{timeCounter}
      </Box> */}
    </div>
  );
}
