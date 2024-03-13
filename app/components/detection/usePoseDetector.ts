import { useCallback, useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import * as posedetection from '@tensorflow-models/pose-detection';

export const usePoseDetector = (
  videoRef: React.RefObject<HTMLVideoElement>,
  canvasRef: React.RefObject<HTMLCanvasElement>
) => {
  const [detector, setDetector] = useState<posedetection.PoseDetector | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isDetectionOn, setIsDetectionOn] = useState(false);

  const startCamera = useCallback(async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraOn(true);
      }
    }
  }, [videoRef]);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      setIsCameraOn(false);
    }
  }, [videoRef]);

  const initDetector = useCallback(async () => {
    await tf.ready();
    const model = posedetection.SupportedModels.MoveNet;
    const detectorConfig = {
      modelType: posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING
    };
    const newDetector = await posedetection.createDetector(model, detectorConfig);
    setDetector(newDetector);
  }, []);

  useEffect(() => {
    initDetector();
  }, [initDetector]);

  const drawResult = useCallback((poses: posedetection.Pose[]) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx && canvasRef.current && videoRef.current) {
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.drawImage(videoRef.current, 0, 0, ctx.canvas.width, ctx.canvas.height);
      poses.forEach((pose) => {
        pose.keypoints.forEach(({ x, y, score }) => {
          if (score && score > 0.5) {
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.fillStyle = 'red';
            ctx.fill();
          }
        });
        const adjacentKeyPoints = posedetection.util.getAdjacentPairs(posedetection.SupportedModels.MoveNet);
        adjacentKeyPoints.forEach(([i, j]) => {
          const kp1 = pose.keypoints[i];
          const kp2 = pose.keypoints[j];
          if (kp1.score && kp2.score && kp1.score > 0.5 && kp2.score > 0.5) {
            ctx.beginPath();
            ctx.moveTo(kp1.x, kp1.y);
            ctx.lineTo(kp2.x, kp2.y);
            ctx.strokeStyle = 'green';
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        });
      });
    }
  }, [canvasRef, videoRef]);

  const detectPoses = useCallback(async () => {
    if (isDetectionOn && detector && videoRef.current && canvasRef.current) {
      const poses = await detector.estimatePoses(videoRef.current, {flipHorizontal: false});
      drawResult(poses);
    }
    requestAnimationFrame(detectPoses);
  }, [isDetectionOn, detector, videoRef, canvasRef, drawResult]);

  useEffect(() => {
    if (isCameraOn) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [isCameraOn, startCamera, stopCamera]);

  return { detector, detectPoses, isCameraOn, setIsCameraOn, isDetectionOn, setIsDetectionOn };
};
