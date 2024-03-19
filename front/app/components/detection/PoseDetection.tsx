import React, { useRef, useEffect } from "react";
import { useCamera } from "./useCamera";
import { usePoseDetector } from "./usePoseDetector";

const PoseDetection: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isCameraOn } = useCamera(videoRef);
  const {
    isDetectionOn,
    detectedPoses,
    handleStartDetection,
    handleStopDetection,
  } = usePoseDetector(videoRef, canvasRef, isCameraOn);

  // 推論の開始/停止を切り替える
  const handleDownload = () => {
    console.log(detectedPoses);
  };

  return (
    <div>
      <button
        onClick={isDetectionOn ? handleStopDetection : handleStartDetection}
      >
        {isDetectionOn ? "Stop Detection" : "Start Detection"}
      </button>
      <button onClick={handleDownload}>download</button>
      <video ref={videoRef} style={{ display: "none" }}>
        <track kind="captions" />
      </video>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default PoseDetection;
