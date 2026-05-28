import { useRef, useCallback } from "react";

export function useWebcam() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const startCamera = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 320 },
        height: { ideal: 240 },
        frameRate: { ideal: 15, max: 15 }
      }
    });

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
