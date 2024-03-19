import React, { useRef, useEffect } from "react";
import { useCamera } from "./useCamera";
import { usePoseDetector } from "./usePoseDetector";

const PoseDetection: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isCameraOn } = useCamera(videoRef);
  const {
    detectPoses,
    isDetectionOn,
    setIsDetectionOn,
    detectedPoses,
    handleResetDetection,
  } = usePoseDetector(videoRef, canvasRef, isCameraOn);

  // 推論の開始/停止を切り替える
  const handleStartDetection = () => {
    handleResetDetection();
    setIsDetectionOn(true);
  };
  const handleStopDetection = () => {
    setIsDetectionOn(false);
  };
  const handleDownload = () => {
    console.log(detectedPoses);
  };

  // 推論を開始する
  useEffect(() => {
    if (isDetectionOn) {
      detectPoses();
    }
  }, [isDetectionOn, detectPoses]);

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
