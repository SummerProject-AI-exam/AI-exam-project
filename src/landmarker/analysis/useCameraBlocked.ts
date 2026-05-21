import { useEffect, useState } from "react";

export function useCameraBlocked(
  videoRef: React.RefObject<HTMLVideoElement | null>
) {
  const [cameraBlocked, setCameraBlocked] = useState(false);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const interval = setInterval(() => {
      const video = videoRef.current;
      if (!video || !ctx) {
        setCameraBlocked(false);
        return;
      }

      // If video not ready, skip
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        setCameraBlocked(false);
        return;
      }

      // Match canvas to video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw current frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Read pixel data
      const frame = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

      // Compute average brightness
      let sum = 0;
      for (let i = 0; i < frame.length; i += 4) {
        // simple luminance approximation
        const r = frame[i];
        const g = frame[i + 1];
        const b = frame[i + 2];
        sum += (r + g + b) / 3;
      }

      const avgBrightness = sum / (frame.length / 4);

      // If brightness is extremely low → camera covered
      setCameraBlocked(avgBrightness < 10); // threshold ~10/255
    }, 500);

    return () => clearInterval(interval);
  }, [videoRef]);

  return cameraBlocked;
}
