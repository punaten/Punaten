import { useState, useEffect, useRef, useCallback } from 'react';
import { usePoseDetector } from '~/components/detection/usePoseDetector';
import { useCamera } from './useCamera';
import { Pose } from '@tensorflow-models/pose-detection/dist/types';
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
    const {
        isDetectionOn,
        detectedPoses,
        handleStartDetection,
        handleStopDetection,
    } = usePoseDetector(webcamRef, canvasRef, isCameraOn);
    const [timeCounter, setTimeCount] = useState<number>(-3000);
    //セットカウンター 今何セット目かをカウント
    
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
                }
                else {
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
            if(!isCameraOn){
                startCamera();
                handleStartDetection();
            }
        } else {
            stopCamera();
            handleStopDetection();
            if(detectedPoses.length > 0){
                console.log(detectedPoses);
            }
        }
    }, [phase, miniPhase]);

    // const incrementPhase = useCallback(() => {
    //     if (phase < maxPhase) {
    //         setPhase(phase + 1);
    //         setMiniPhase(0); // フェーズが変わったらミニフェーズをリセット
    //     }
    // }, [phase, maxPhase]);

    // const incrementMiniPhase = useCallback(() => {
    //     if (miniPhase < 1) {
    //         setMiniPhase(miniPhase + 1);
    //     } else {
    //         incrementPhase(); // ミニフェーズが最大に達したらフェーズを進める
    //     }
    // }, [miniPhase, incrementPhase]);



    // const resetTime = () => {
    //     setTimeCount(-restTime);
    // }

    // //完了
    // //次のセットへ。最後のセットの場合は、撮影を停止
    // const handleFinishRecording = () => {
    //     setSetCount((c) => c + 1);
    //     resetTime()
    //     handleStopDetection();
    //     if (setCounter <= setNum) {
    //         setTimeout(() => handleSet(setCounter + 1), 2000); // 休憩後に次のセットを開始
    //     }
    // }

    // //撮り直し
    // //ローカルの推定データをリセットして、撮影を再開
    // const handleRestartRecording = () => {
    //     handleSet(setCounter);
    // };

    // //キャンセル
    // //撮影を停止, カメラを停止, セットカウンターをリセット, ローカルの推定データをリセット
    // const handleCancelRecording = () => {
    //     handleStopDetection();
    //     stopCamera();
    //     setSetCount(1);
    // };

    // const handleDownload = (poses: Pose[][]) => {
    //     console.log(poses);
    // };
    // //カメラ切り替え
    // const toggleCamera = () => {
    //     if (isCameraOn) {
    //         stopCamera();
    //     } else {
    //         startCamera();
    //     }
    // }

    // //撮影を止める
    // const handleStopCaptureClick = useCallback(() => {
    //     handleStopDetection();
    //     stopCamera();
    // }, [handleStopDetection, stopCamera]);

    // const handleSet = useCallback((setCount: number) => {
    //     if (setCount <= setNum) {
    //         setSetCount(setCount);
    //         resetTime()
    //         handleStartDetection();
    //         let localTimeCounter = -restTime;
    //         const intervalId = setInterval(() => {
    //             localTimeCounter += 50;
    //             setTimeCount(localTimeCounter);
    //             if (localTimeCounter >= videoLength) {
    //                 clearInterval(intervalId);
    //                 handleDownload(detectedPoses);
    //                 setTimeout(() => handleSet(setCount + 1), 2000); // 休憩後に次のセットを開始
    //             }
    //         }, 50);
    //     } else {
    //         handleStopCaptureClick(); // 最後のセットが終了したら撮影を停止
    //     }
    // }, [setNum, videoLength, handleStartDetection, handleDownload, detectedPoses, handleStopCaptureClick]);

    //撮影開始
    // const handleStartCaptureClick = useCallback(() => {
    //     //フェーズを更新
    //     incrementPhase();
    //     //ミニフェーズを更新
    //     incrementMiniPhase();
    //     // if (!isCameraOn) {
    //     //     startCamera();
    //     // }
    //     // handleSet(1);
    // }, [isCameraOn, startCamera, handleSet]);

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
    }
}

export { useRecording };