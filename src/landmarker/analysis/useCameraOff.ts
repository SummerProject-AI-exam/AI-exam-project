import { useEffect, useRef, useState } from "react";

export function useCameraOff(
  videoRef: React.RefObject<HTMLVideoElement | null>) {
  const [cameraOff, setCameraOff] = useState(false);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const video = videoRef.current;

      if (Date.now() - startTimeRef.current < 500) {
        setCameraOff(false);
        return;
      }

      if (!video) {
        setCameraOff(true);
        return;
      }
      const stream = video.srcObject;

      if (!(stream instanceof MediaStream)) {
        setCameraOff(true);
        return;
      }

      const videoTrack = stream.getVideoTracks()[0];
      if (!videoTrack || videoTrack.readyState !== "live") {
        setCameraOff(true);
        return;
      }


      if (video.videoWidth === 0 || video.videoHeight === 0) {
        setCameraOff(true);
        return;
      }

      setCameraOff(false);
    }, 200);

    return () => clearInterval(interval);
  }, [videoRef]);

  return cameraOff;
}
