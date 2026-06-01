import { useEffect, useState } from "react";

export function useCameraReady(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const [cameraReady, setCameraReady] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const video = videoRef.current;

      if (!video) {
        setCameraReady(false);
        return;
      }

      const ready = video.videoWidth > 0 && video.videoHeight > 0;
      setCameraReady(ready);
    }, 200);

    return () => clearInterval(interval);
  }, [videoRef]);

  return cameraReady;
}