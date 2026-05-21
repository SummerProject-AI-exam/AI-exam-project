import { useEffect, useState } from "react";

export function useCameraOff(
  videoRef: React.RefObject<HTMLVideoElement | null>
) {
  const [cameraOff, setCameraOff] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const video = videoRef.current;

      if (!video) {
        setCameraOff(true);
        return;
      }

      const stream = video.srcObject as MediaStream | null;

      if (!stream) {
        setCameraOff(true);
        return;
      }

      const track = stream.getVideoTracks()[0];

      // Track missing or ended → camera off
      if (!track || track.readyState !== "live") {
        setCameraOff(true);
        return;
      }

      // Video element not producing frames → camera off
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        setCameraOff(true);
        return;
      }

      // Otherwise camera is on
      setCameraOff(false);
    }, 300);

    return () => clearInterval(interval);
  }, [videoRef]);

  return cameraOff;
}
