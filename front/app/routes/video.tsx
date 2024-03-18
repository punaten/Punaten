import React, { useEffect, useState } from 'react';

// FileEvent型を定義し、onChangeイベントの型として使用
type FileEvent = React.ChangeEvent<HTMLInputElement>;

function App() {
    const [videoSrc, setVideoSrc] = useState<string>('');
    const [backgroundSrc, setBackgroundSrc] = useState<string>('');
    const [isLoading, setLoading] = useState<boolean>(false);
    // 生成された動画のURLを保持するための新しいステート
    const [outputVideoSrc, setOutputVideoSrc] = useState<string>('');

    // handleVideoFileとhandleBackgroundFile関数にFileEvent型を適用
    const handleVideoFile = async (event: FileEvent) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;
        const file = files[0];
        setVideoSrc(URL.createObjectURL(file));
    };

    const handleBackgroundFile = async (event: FileEvent) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;
        const file = files[0];
        setBackgroundSrc(URL.createObjectURL(file));
    };
    const createChromaKeyComposite = () => {
        setLoading(true);
        const video = document.createElement('video');
        video.src = videoSrc;
        video.muted = true;
        video.autoplay = true;

        const background = new Image();
        background.src = backgroundSrc;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return; // ctxがnullの場合は処理を中断

        let mediaRecorder: MediaRecorder;
        let recordedChunks: BlobPart[] = [];

        background.onload = () => {
            canvas.width = background.width;
            canvas.height = background.height;

            video.onloadedmetadata = () => {
                // 入力動画から音声トラックを取得
                const audioContext = new AudioContext();
                const source = audioContext.createMediaElementSource(video);
                const destination = audioContext.createMediaStreamDestination();
                source.connect(destination);

                const scale = Math.min(canvas.width / video.videoWidth, canvas.height / video.videoHeight);
                const vidWidth = video.videoWidth * scale;
                const vidHeight = video.videoHeight * scale;
                const vidX = (canvas.width - vidWidth) / 2;
                const vidY = (canvas.height - vidHeight) / 2;

                // MediaStreamの型を指定
                const stream = canvas.captureStream(30); // 30fpsでストリームをキャプチャ
                const audioTrack = destination.stream.getAudioTracks()[0]; // 音声トラックを取得

                const ms = new MediaStream([...stream.getVideoTracks(), audioTrack]); // ビデオと音声のトラックを含むMediaStreamを作成
                mediaRecorder = new MediaRecorder(ms, { mimeType: 'video/webm' });

                mediaRecorder.ondataavailable = (event: BlobEvent) => {
                    if (event.data.size > 0) {
                        recordedChunks.push(event.data);
                    }
                };

                mediaRecorder.onstop = () => {
                    const blob = new Blob(recordedChunks, { type: 'video/webm' });
                    const url = URL.createObjectURL(blob);
                    // ダウンロードリンクの代わりに、outputVideoSrcステートを更新
                    setOutputVideoSrc(url);
                    setLoading(false);
                };


                mediaRecorder.start();

                const backgroundCanvas = document.createElement('canvas');
                const bgCtx = backgroundCanvas.getContext('2d');
                backgroundCanvas.width = canvas.width;
                backgroundCanvas.height = canvas.height;
                bgCtx.drawImage(background, 0, 0, canvas.width, canvas.height);

                // 背景画像のピクセルデータを予め取得しておく
                const bgFrame = bgCtx.getImageData(0, 0, canvas.width, canvas.height);
                const bgData = bgFrame.data;


                const draw = () => {
                    if (video.paused || video.ended) {
                        mediaRecorder.stop();
                        return;
                    }

                    ctx.drawImage(video, vidX, vidY, vidWidth, vidHeight);
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

                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(video, vidX, vidY, vidWidth, vidHeight);

                let frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const l = frame.data.length / 4;

                for (let i = 0; i < l; i++) {
                    const r = frame.data[i * 4 + 0];
                    const g = frame.data[i * 4 + 1];
                    const b = frame.data[i * 4 + 2];
                    if (g > 100 && r < 100 && b < 100) {
                        // 背景のピクセルデータで置き換える
                        frame.data[i * 4 + 0] = bgData[i * 4 + 0];
                        frame.data[i * 4 + 1] = bgData[i * 4 + 1];
                        frame.data[i * 4 + 2] = bgData[i * 4 + 2];
                        // Alpha値はそのまま（bgData[i * 4 + 3]）である必要があるが、
                        // 背景画像は完全に不透明なので設定不要
                    }
                }

                ctx.putImageData(frame, 0, 0);
                requestAnimationFrame(draw);
                video.play().then(draw);
            };

        };
    };

    useEffect(() => {
        if (videoSrc && backgroundSrc) {
            createChromaKeyComposite();
        }
    }, [videoSrc, backgroundSrc]);

    return (
        <div className="app">
            <h1>Chroma Key Compositing</h1>
            <div>
                <input type="file" accept="video/*" onChange={handleVideoFile} />
                <input type="file" accept="image/*" onChange={handleBackgroundFile} />
            </div>
            {isLoading && <p>Loading...</p>}
            {/* 生成された動画を表示するvideoタグ */}
            {outputVideoSrc && (
                <video src={outputVideoSrc} controls autoPlay loop style={{ maxWidth: '100%' }}></video>
            )}
        </div>
    );
}

export default App;