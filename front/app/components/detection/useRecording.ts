import { useState, useEffect, useRef, useCallback } from 'react';
import { usePoseDetector } from '~/components/detection/usePoseDetector';
import { useCamera } from './useCamera';
import { Pose } from '@tensorflow-models/pose-detection/dist/types';
import { useClustering } from './useClustering';
const useRecording = () => {
  const videoLength = 8000;
  const restTime = 4000;
  const setNum = 3;
  const webcamRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

    const maxPhase = 3;
    const [phase, setPhase] = useState<number>(0);
    const [miniPhase, setMiniPhase] = useState<number>(0);
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [remainingTime, setRemainingTime] = useState<number>(0);
    const { isCameraOn, startCamera, stopCamera } = useCamera(webcamRef)
    const [ catKind, setCatKind ] = useState<string[]>([]); // 猫の種類
    const {
        isDetectionOn,
        detectedPoses,
        handleStartDetection,
        handleStopDetection,
    } = usePoseDetector(webcamRef, canvasRef, isCameraOn);
    const [timeCounter, setTimeCount] = useState<number>(-3000);
    const { nekoType } = useClustering(detectedPoses, timeCounter, setCatKind);
    //セットカウンター 今何セット目かをカウント
    
    const startRecording = useCallback(() => {
        setIsRecording(true);
        setPhase(1);
        setMiniPhase(0); // 撮影を開始するためにミニフェーズを1に設定
        setRemainingTime(restTime); // 撮影時間を設定
    }, []);

  const startRecording = useCallback(() => {
    setIsRecording(true);
    setPhase(1);
    setMiniPhase(0); // 撮影を開始するためにミニフェーズを1に設定
    setRemainingTime(restTime); // 撮影時間を設定
  }, []);

  const cancelRecording = useCallback(() => {
    setIsRecording(false);
    setPhase(0);
    setMiniPhase(0);
    setRemainingTime(0);
  }, []);

  const finishRecording = useCallback(() => {
    if (phase < maxPhase) {
      setPhase((prevPhase) => prevPhase + 1); // 次のフェーズに移行
      setMiniPhase(0); // ミニフェーズをリセット
      setRemainingTime(restTime); // 休憩時間を設定
    } else {
      setIsRecording(false); // 撮影を完了
      setPhase(0); // フェーズをリセット
      setMiniPhase(0); // ミニフェーズをリセット
      setRemainingTime(0); // 残り時間をリセット
    }
  }, [phase, maxPhase]);

  const restartRecording = useCallback(() => {
    setMiniPhase(1); // 撮影を再開するためにミニフェーズを1に設定
    setRemainingTime(videoLength); // 撮影時間をリセット
  }, []);

  useEffect(() => {
    if (isRecording) {
      const timerId = setTimeout(() => {
        if (phase === 0 && miniPhase === 0) {
          setPhase(1); // 撮影を開始するためにフェーズを1に設定
          setMiniPhase(0); // 休憩中のフェーズを維持
          setRemainingTime(restTime); // 休憩時間を設定
        } else if (phase === maxPhase && miniPhase === 1) {
          setIsRecording(false); // 撮影を完了
          setPhase(0); // フェーズをリセット
          setMiniPhase(0); // ミニフェーズをリセット
        } else if (miniPhase === 1) {
          // 撮影中のフェーズが終了
          setMiniPhase(0); // 休憩中のフェーズに移行
          setPhase((prevPhase) => prevPhase + 1); // フェーズを進める
          setRemainingTime(restTime); // 休憩時間を設定
        } else {
          // 休憩中のフェーズが終了
          setMiniPhase(1); // 撮影中のフェーズに移行
          setRemainingTime(videoLength); // 撮影時間を設定
        }
      }, remainingTime);

      return () => {
        clearTimeout(timerId);
      };
    }
  }, [isRecording, phase, miniPhase, remainingTime]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setRemainingTime((prevTime) => (prevTime > 0 ? prevTime - 100 : 0));
    }, 100);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    //phaseが0でない時にカメラを起動
    if (phase === 1 && miniPhase === 0) {
      startCamera();
    }
    //mini phaseが1の時に、推論の開始
    else if (miniPhase === 1) {
      if (!isCameraOn) {
        startCamera();
        handleStartDetection();
      }
    } else {
      stopCamera();
      handleStopDetection();
      if (detectedPoses.length > 0) {
        const nekoType = getNekoType(detectedPoses);
        console.log(detectedPoses);
        console.log(nekoType);
      }
    }
  }, [phase, miniPhase]);

  return {
    webcamRef,
    canvasRef,
    isCameraOn,
    isDetectionOn,
    phase,
    videoLength,
    setNum,
    timeCounter,
    startRecording,
    restartRecording,
    cancelRecording,
    finishRecording,
    remainingTime,
    miniPhase,
  };
};

export { useRecording };
