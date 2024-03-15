import React, { useRef, useState, useEffect } from 'react';
import { usePoseDetector } from './usePoseDetector';
import { Pose } from '@tensorflow-models/pose-detection/dist/types';

const DownloadDetection: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { detector, detectPoses, isDetectionOn, setIsDetectionOn } = usePoseDetector(videoRef, canvasRef, true);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [poseData, setPoseData] = useState<Pose[]>([]);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (videoFile && videoRef.current) {
            const videoUrl = URL.createObjectURL(videoFile);
            videoRef.current.src = videoUrl;
            videoRef.current.load();
            videoRef.current.onloadeddata = () => {
                setIsDetectionOn(true);
            };
            videoRef.current.onended = () => {
                // setIsDetectionOn(false);
            };
        }
    }, [videoFile, setIsDetectionOn]);

    const handleStartDetection = async () => {
        if (videoRef.current && detector && isDetectionOn) {
            setPoseData([]);
            videoRef.current.play();
            const totalFrames = Math.floor((videoRef.current.duration || 0) * 30); // 30fpsを仮定
            let currentFrame = 0;

            const detect = async () => {
                if (currentFrame >= totalFrames || videoRef.current?.ended) {
                    // setIsDetectionOn(false);
                    return;
                }
                // ビデオのフレームが利用可能になるのを待つ
                await new Promise((resolve) => videoRef.current?.requestVideoFrameCallback(resolve));
                const poses = await detectPoses();
                if (poses) {
                    setPoseData((prevData) => [...prevData, ...poses]);
                }
                currentFrame++;
                setProgress((currentFrame / totalFrames) * 100);
                requestAnimationFrame(detect);
            };
            detect();
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPoseData([]);
        const files = event.target.files;
        if (files && files.length > 0) {
            setVideoFile(files[0]);
            setProgress(0);
            setPoseData([]);
            setIsDetectionOn(false);
        }
    };

    const handleRemoveVideo = () => {
        setVideoFile(null);
        setProgress(0);
        setPoseData([]);
        setIsDetectionOn(false);
        if (videoRef.current) {
            videoRef.current.src = '';
        }
    };

    const downloadPoseData = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(poseData));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "pose_data.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    return (
        <div>
            <input type="file" accept="video/*" onChange={handleFileChange} />
            <button style={{ display: 'block', width: '100%' }} onClick={handleStartDetection} disabled={!videoFile || !isDetectionOn}>Start Detection</button>
            <button style={{ display: 'block', width: '100%' }} onClick={downloadPoseData} disabled={!poseData.length}>Download Pose Data</button>
            <button style={{ display: 'block', width: '100%' }} onClick={handleRemoveVideo} disabled={!videoFile}>Remove Video</button>
            <progress value={progress} max="100"></progress>
            <video ref={videoRef} style={{ display: 'none' }} muted>
                <track kind="captions" />
            </video>
            <canvas ref={canvasRef} />
        </div>
    );
};

export default DownloadDetection;
