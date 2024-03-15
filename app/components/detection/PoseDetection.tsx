import React, { useRef, useEffect } from 'react';
import { useCamera } from './useCamera';
import { usePoseDetector } from './usePoseDetector';

const PoseDetection: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { startCamera, stopCamera, isCameraOn } = useCamera(videoRef);
  const { detectPoses, isDetectionOn, setIsDetectionOn } = usePoseDetector(
    videoRef,
    canvasRef,
    isCameraOn
  );

  // カメラの起動/停止を切り替える
  const toggleCamera = () => {
    if (isCameraOn) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  // 推論の開始/停止を切り替える
  const toggleDetection = () => {
    setIsDetectionOn(!isDetectionOn);
  };

  // 推論を開始する
  useEffect(() => {
    if (isDetectionOn) {
      detectPoses();
    }
  }, [isDetectionOn, detectPoses]);

  return (
    <div>
      <button onClick={toggleCamera}>{isCameraOn ? 'Turn Camera Off' : 'Turn Camera On'}</button>
      <button onClick={toggleDetection}>{isDetectionOn ? 'Stop Detection' : 'Start Detection'}</button>
      <video ref={videoRef} style={{ display: 'none' }}>
        <track kind="captions" />
      </video>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default PoseDetection;
