import { useState, useEffect, useRef, useCallback } from 'react';
import { usePoseDetector } from '~/components/detection/usePoseDetector';
import { useCamera } from './useCamera';
import { Pose } from '@tensorflow-models/pose-detection/dist/types';
const useRecording = () => {
    const videoLength = 6000;
    const setNum = 3;
    const webcamRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const maxPhase = 3;
    //フェーズ 最初が0、最後がmaxPhase
    const [phase, setPhase] = useState<number>(0);
    const incrementPhase = () => {
        if (phase < maxPhase) {
            setPhase(phase + 1);
        }
    }
    //ミニフェーズ 0か1 0の場合は休憩中、1の場合は撮影中
    const [miniPhase, setMiniPhase] = useState<number>(0);
    const incrementMiniPhase = () => {
        if (miniPhase < 1) {
            setMiniPhase(miniPhase + 1);
        }
        else {
            setMiniPhase(0);
        }
    }


    const [timeCounter, setTimeCount] = useState<number>(-3000);
    //セットカウンター 今何セット目かをカウント
    const [setCounter, setSetCount] = useState<number>(1);
    const { isCameraOn, startCamera, stopCamera } = useCamera(webcamRef)
    const {
        isDetectionOn,
        detectedPoses,
        handleStartDetection,
        handleStopDetection,
    } = usePoseDetector(webcamRef, canvasRef, isCameraOn);

    const resetTime = () => {
        setTimeCount(-3000);
    }

    //完了
    //次のセットへ。最後のセットの場合は、撮影を停止
    const handleFinishRecording = () => {
        setSetCount((c) => c + 1);
        resetTime()
        handleStopDetection();
        if (setCounter <= setNum) {
            setTimeout(() => handleSet(setCounter + 1), 2000); // 休憩後に次のセットを開始
        }
    }

    //撮り直し
    //ローカルの推定データをリセットして、撮影を再開
    const handleRestartRecording = () => {
        handleSet(setCounter);
    };

    //キャンセル
    //撮影を停止, カメラを停止, セットカウンターをリセット, ローカルの推定データをリセット
    const handleCancelRecording = () => {
        handleStopDetection();
        stopCamera();
        setSetCount(1);
    };

    const handleDownload = (poses: Pose[][]) => {
        console.log(poses);
    };
    //カメラ切り替え
    const toggleCamera = () => {
        if (isCameraOn) {
            stopCamera();
        } else {
            startCamera();
        }
    }

    //撮影を止める
    const handleStopCaptureClick = useCallback(() => {
        handleStopDetection();
        stopCamera();
    }, [handleStopDetection, stopCamera]);

    const handleSet = useCallback((setCount: number) => {
        if (setCount <= setNum) {
            setSetCount(setCount);
            resetTime()
            handleStartDetection();
            let localTimeCounter = -3000;
            const intervalId = setInterval(() => {
                localTimeCounter += 50;
                setTimeCount(localTimeCounter);
                if (localTimeCounter >= videoLength) {
                    clearInterval(intervalId);
                    handleDownload(detectedPoses);
                    setTimeout(() => handleSet(setCount + 1), 2000); // 休憩後に次のセットを開始
                }
            }, 50);
        } else {
            handleStopCaptureClick(); // 最後のセットが終了したら撮影を停止
        }
    }, [setNum, videoLength, handleStartDetection, handleDownload, detectedPoses, handleStopCaptureClick]);

    //撮影開始
    const handleStartCaptureClick = useCallback(() => {
        //フェーズを更新
        incrementPhase();
        //ミニフェーズを更新
        incrementMiniPhase();
        // if (!isCameraOn) {
        //     startCamera();
        // }
        // handleSet(1);
    }, [isCameraOn, startCamera, handleSet]);

    // useEffect(() => {
    //     if (isDetectionOn) {
    //         const timeoutId = setTimeout(() => {
    //             setTimeCount((c) => c + 500);
    //         }, 500);

    //         if (timeCounter >= videoLength) {
    //             handleStopDetection();
    //             handleDownload(detectedPoses);
    //             setSetCount((c) => c + 1);
    //             resetTime()
    //         }

    //         return () => {
    //             clearTimeout(timeoutId);
    //         };
    //     } else if (setCounter !== 0 && setCounter <= setNum) {
    //         const timeoutId = setTimeout(() => {
    //             setTimeCount((c) => c + 500);
    //         }, 500);

    //         // if (timeCounter >= 0) {
    //         //     handleStartDetection();
    //         // }

    //         return () => {
    //             clearTimeout(timeoutId);
    //         };
    //     }
    // }, [timeCounter, setCounter, isDetectionOn]);

    return {
        webcamRef,
        canvasRef,
        isCameraOn,
        toggleCamera,
        handleStartCaptureClick,
        handleStopCaptureClick,
        handleFinishRecording,
        handleRestartRecording,
        handleCancelRecording,
        handleDownload,
        isDetectionOn,
        setCounter,
        videoLength,
        setNum,
        timeCounter,
    }
}

export { useRecording };