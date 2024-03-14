import React, { useRef, useState, useEffect } from 'react';
import { usePoseDetector } from './usePoseDetector';
import * as posedetection from '@tensorflow-models/pose-detection';

const DownloadDetection: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { detector, detectPoses, isDetectionOn, setIsDetectionOn } = usePoseDetector(videoRef, canvasRef, true);
    const [posesData, setPosesData] = useState< posedetection.Pose[]>([]);
    const [videoFile, setVideoFile] = useState<File | null>(null);

    useEffect(() => {
        if (videoFile && videoRef.current) {
            const videoUrl = URL.createObjectURL(videoFile);
            videoRef.current.src = videoUrl;
            setIsDetectionOn(true);
        }
    }, [videoFile, setIsDetectionOn]);

    useEffect(() => {
        if (detector && isDetectionOn) {
            const intervalId = setInterval(async () => {
                const poses = await detectPoses();
                if (poses) {
                    setPosesData((prevData) => [...prevData, ...poses]);
                }
            }, 100); // Adjust the interval as needed
            return () => clearInterval(intervalId);
        }
    }, [detector, isDetectionOn, detectPoses]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            setVideoFile(files[0]);
        }
    };

    const downloadResults = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(posesData));
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
            <button onClick={downloadResults}>Download Results</button>
            <video ref={videoRef} style={{ display: 'none' }} autoPlay muted loop>
                <track kind="captions" />
            </video>
            <canvas ref={canvasRef} />
        </div>
    );
};

export default DownloadDetection;
