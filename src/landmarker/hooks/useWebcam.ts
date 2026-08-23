import { useRef, useCallback } from "react";

export function useWebcam() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const startCamera = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: "user"
      }
    });

    if (videoRef.current) {
      videoRef.current.srcObject = stream;

      await new Promise((resolve) => {
        videoRef.current!.onloadedmetadata = () => resolve(true);
      });

      // decoding starting
      await videoRef.current.play();

      // Readiness diagnosting
      console.log("readyState:", videoRef.current.readyState);
      console.log("videoWidth:", videoRef.current.videoWidth);
      console.log("videoHeight:", videoRef.current.videoHeight);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject instanceof MediaStream) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
    }
  }, []);

  return { videoRef, startCamera, stopCamera };
}
