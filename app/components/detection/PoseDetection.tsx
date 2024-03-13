import React, { useRef, useState, useEffect } from 'react';
import { useCamera } from './useCamera';
import { usePoseDetector } from './usePoseDetector';

const PoseDetection: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { startCamera, stopCamera } = useCamera(videoRef);
    const { detector, detectPoses, isDetectionOn, setIsDetectionOn } = usePoseDetector(videoRef, canvasRef);

    const [isCameraOn, setIsCameraOn] = useState(true);

    const toggleCamera = () => {
        if (isCameraOn) {
            stopCamera();
        } else {
            startCamera();
        }
        setIsCameraOn(!isCameraOn);
    };

    const toggleDetection = () => {
        setIsDetectionOn(!isDetectionOn);
    };

    // 推論を開始するための useEffect フック
    useEffect(() => {
        if (detector && isDetectionOn) {
            detectPoses();
        }
    }, [detector, isDetectionOn, detectPoses]);

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
