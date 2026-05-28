import { useRef, useCallback } from "react";

export function useWebcam() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const startCamera = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: "user" },
        width: { ideal: 640, min: 320 },
        height: { ideal: 480, min: 240 },
        frameRate: { ideal: 15 }
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
