import { useCallback, useEffect, useState } from "react";

export const useCamera = (videoRef: React.RefObject<HTMLVideoElement>) => {
  const [isCameraOn, setIsCameraOn] = useState(false);

  // useEffect(() => {
  //   const startCamera = async () => {
  //     if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  //       const stream = await navigator.mediaDevices.getUserMedia({
  //         video: true,
  //       });
  //       if (videoRef.current) {
  //         videoRef.current.srcObject = stream;
  //         videoRef.current.onloadedmetadata = () => {
  //           videoRef.current?.play();
  //           setIsCameraOn(true);
  //         };
  //       }
  //     }
  //   };
  //   startCamera();
  // }, [videoRef]);

  // useEffect(() => {
  //   const startCamera = async () => {
  //     if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  //       const stream = await navigator.mediaDevices.getUserMedia({
  //         video: true,
  //       });
  //       if (videoRef.current) {
  //         videoRef.current.srcObject = stream;
  //         await videoRef.current.play();
  //         setIsCameraOn(true);
  //       }
  //     }
  //   };
  //   startCamera();
  // }, [videoRef]);

  const startCamera = useCallback(async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
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

  return { isCameraOn, startCamera, stopCamera };
};
