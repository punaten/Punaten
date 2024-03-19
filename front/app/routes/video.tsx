import React, { useRef, useState } from 'react';

function App() {
    const [fileSrc, setFileSrc] = useState<string[]>(["edm", "Girlfriend", "happy_happy", "shikarareru", "yonezu_happy"]);
    const [backgroundSrc, setBackgroundSrc] = useState<string>('');
    const [isLoading, setLoading] = useState<boolean>(false);
    const canvasRef = useRef<HTMLCanvasElement>(null); // canvasへの参照
    const videoRef = useRef<HTMLVideoElement>(null); // videoタグへの参照を追加

    const handleBackgroundFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;
        const file = files[0];
        setBackgroundSrc(URL.createObjectURL(file));
    };

    const createChromaKeyComposite = async () => {
        if (!canvasRef.current || !videoRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        setLoading(true);

        // 背景画像をロード
        const background = new Image();
        background.src = backgroundSrc;
        await new Promise((resolve) => {
            background.onload = () => {
                canvas.width = background.width;
                canvas.height = background.height;
                ctx.drawImage(background, 0, 0);
                resolve(true);
            };
        });

        // ランダムに動画ファイル名を選択
        const videoAndAudioFileName = fileSrc[Math.floor(Math.random() * fileSrc.length)];
        const videoSrc = "/public/" + videoAndAudioFileName + ".mp4";

        // video要素を設定
        const video = document.createElement('video');
        video.src = videoSrc;
        video.muted = true;
        video.autoplay = true;
        await new Promise((resolve) => {
            video.onloadedmetadata = () => resolve(true);
        });

        // Audio setup
        const audioContext = new AudioContext();
        const audioData = await fetch("/public/" + videoAndAudioFileName + ".mp3").then(response => response.arrayBuffer());
        const decodedAudioData = await audioContext.decodeAudioData(audioData);
        const audioSource = audioContext.createBufferSource();
        audioSource.buffer = decodedAudioData;
        const destination = audioContext.createMediaStreamDestination();
        audioSource.connect(destination);
        audioSource.start(0); // オーディオの再生を開始

        // Canvasからのストリームをvideoタグのソースとして設定
        const stream = canvas.captureStream();
        videoRef.current.srcObject = stream;

        // 背景画像のピクセルデータを取得
        const bgFrame = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const bgData = bgFrame.data;

        const draw = () => {
            if (video.paused || video.ended) {
                setLoading(false);
                return;
            }

            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            let frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const l = frame.data.length / 4;

            for (let i = 0; i < l; i++) {
                const r = frame.data[i * 4 + 0];
                const g = frame.data[i * 4 + 1];
                const b = frame.data[i * 4 + 2];
                // 緑色のピクセルを背景画像のピクセルで置き換える
                if (g > 100 && r < 100 && b < 100) {
                    frame.data[i * 4 + 0] = bgData[i * 4 + 0];
                    frame.data[i * 4 + 1] = bgData[i * 4 + 1];
                    frame.data[i * 4 + 2] = bgData[i * 4 + 2];
                }
            }

            ctx.putImageData(frame, 0, 0);
            requestAnimationFrame(draw);
        };

        video.play().then(() => {
            requestAnimationFrame(draw);
        });

        // オーディオとビデオの準備ができた後
        const audioStream = destination.stream; // オーディオストリームを取得
        const videoStream = canvas.captureStream(25); // 25fpsでキャンバスからビデオストリームを取得

        // videoRefが参照するビデオ要素にストリームを設定
        if (videoRef.current) {
            videoRef.current.srcObject = new MediaStream([...videoStream.getVideoTracks(), ...audioStream.getAudioTracks()]);
            videoRef.current.play().catch(error => console.error('Video play failed', error));
        }

        setLoading(false);
    };

    const handleClickGenerate = () => {
        if (!backgroundSrc) {
            alert('背景画像を選択してください');
            return;
        }
        createChromaKeyComposite();
    }

    return (
        <div className="app">
            <h1>Chroma Key Compositing</h1>
            <div>
                <input type="file" accept="image/*" onChange={handleBackgroundFile} />
            </div>
            <button onClick={handleClickGenerate}>生成</button>
            {isLoading && <p>Loading...</p>}
            <canvas ref={canvasRef} style={{ display: 'none' }}></canvas> {/* canvasを非表示に */}
            <video ref={videoRef} controls autoPlay style={{ maxWidth: '100%' }}></video> {/* video要素を追加 */}
        </div>
    );
}

export default App;