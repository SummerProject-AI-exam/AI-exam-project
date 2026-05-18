import { useRef, useCallback } from "react";

export function useWebcam() {
  const videoRef = useRef<HTMLVideoElement>(null);

  //  Start webcam and wait for it to play
  const startCamera = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject instanceof MediaStream) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
    }
  }, []);

  return { videoRef, startCamera, stopCamera };
}
