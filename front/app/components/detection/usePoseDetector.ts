import { useCallback, useEffect, useState } from "react";
import * as tf from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";
import * as posedetection from "@tensorflow-models/pose-detection";

export const usePoseDetector = (
  videoRef: React.RefObject<HTMLVideoElement>,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  isCameraOn: boolean
) => {
  const [detectedPoses, setDetectedPoses] = useState<posedetection.Pose[][]>(
    []
  );
  const [detector, setDetector] = useState<posedetection.PoseDetector | null>(
    null
  );
  const [isDetectionOn, setIsDetectionOn] = useState(false);
  const [isInterval, setIsInterval] = useState(false);

  const initDetector = useCallback(async () => {
    await tf.ready();
    const model = posedetection.SupportedModels.MoveNet;
    const detectorConfig = {
      modelType: posedetection.movenet.modelType.MULTIPOSE_LIGHTNING,
      modelUrl: "https://storage.googleapis.com/punaten/model.json"
    };
    const newDetector = await posedetection.createDetector(
      model,
      detectorConfig
    );
    setDetector(newDetector);
  }, []);

  useEffect(() => {
    initDetector();
  }, [initDetector]);

  const drawResult = useCallback(
    (poses: posedetection.Pose[]) => {
      const ctx = canvasRef.current?.getContext("2d");
      if (ctx && canvasRef.current && videoRef.current) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.drawImage(
          videoRef.current,
          0,
          0,
          ctx.canvas.width,
          ctx.canvas.height
        );
        poses.forEach((pose) => {
          pose.keypoints.forEach(({ x, y, score }) => {
            if (score && score > 0.5) {
              ctx.beginPath();
              ctx.arc(x, y, 5, 0, 2 * Math.PI);
              ctx.fillStyle = "red";
              ctx.fill();
            }
          });
          const adjacentKeyPoints = posedetection.util.getAdjacentPairs(
            posedetection.SupportedModels.MoveNet
          );
          adjacentKeyPoints.forEach(([i, j]) => {
            const kp1 = pose.keypoints[i];
            const kp2 = pose.keypoints[j];
            if (kp1.score && kp2.score && kp1.score > 0.5 && kp2.score > 0.5) {
              ctx.beginPath();
              ctx.moveTo(kp1.x, kp1.y);
              ctx.lineTo(kp2.x, kp2.y);
              ctx.strokeStyle = "green";
              ctx.lineWidth = 2;
              ctx.stroke();
            }
          });
        });
      }
    },
    [canvasRef, videoRef]
  );

  const detectPoses = useCallback(
    async () => {
      if (isCameraOn && detector && videoRef.current && canvasRef.current) {
        const poses = await detector.estimatePoses(videoRef.current, {
          flipHorizontal: false,
        });
        if (poses.length > 0) {
          setDetectedPoses((prev) => [...prev, poses]);
        } else {
          setIsInterval(!isInterval);
        }
        drawResult(poses);
        return poses; // ポーズデータを返す
      }
      return null; // 推論が行われない場合はnullを返す
    },
    [
      isDetectionOn,
      isInterval,
      isCameraOn,
      detector,
      videoRef,
      canvasRef,
      drawResult,
      detectedPoses,
    ]
  );

  // フラグの変更時にポーズ検出の状態を変更
  useEffect(() => {
    detectPoses();
  }, [isDetectionOn, isInterval, detectedPoses, detectPoses]);

  const handleStartDetection = () => {
    setDetectedPoses([]);
    setIsDetectionOn(true);
  };
  const handleStopDetection = () => {
    setIsDetectionOn(false);
  };

  return {
    detector,
    detectPoses,
    isDetectionOn,
    setIsDetectionOn,
    detectedPoses,
    handleStartDetection,
    handleStopDetection,
  };
};
