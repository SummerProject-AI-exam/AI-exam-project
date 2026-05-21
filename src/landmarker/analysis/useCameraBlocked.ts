import { useEffect, useState } from "react";

// --- Sharpness check ---
function computeSharpness(
  data: Uint8ClampedArray,
  width: number,
  height: number
) {
  let edges = 0;

  for (let y = 1; y < height; y += 4) {
    for (let x = 1; x < width; x += 4) {
      const i = (y * width + x) * 4;
      const v = data[i];

      const vLeft = data[i - 4];
      const vUp = data[i - width * 4];

      if (Math.abs(v - vLeft) > 20) edges++;
      if (Math.abs(v - vUp) > 20) edges++;
    }
  }

  return edges;
}

export function useCameraBlocked(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  faceDetected: boolean
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

      // --- Variance ---
      let sumVar = 0;
      let sumSqVar = 0;
      const n = frame.length / 4;

      for (let i = 0; i < frame.length; i += 4) {
        const v = (frame[i] + frame[i + 1] + frame[i + 2]) / 3;
        sumVar += v;
        sumSqVar += v * v;
      }

      const mean = sumVar / n;
      const variance = sumSqVar / n - mean * mean;

      const sharpness = computeSharpness(frame, canvas.width, canvas.height);

      let flatPixels = 0;

      for (let i = 0; i < frame.length; i += 4) {
        const r = frame[i];
        const g = frame[i + 1];
        const b = frame[i + 2];

        const v = (r + g + b) / 3;

        // pixel is too dark OR too bright OR too uniform
        if (v < 30 || v > 220 || Math.abs(r - g) < 10 && Math.abs(g - b) < 10) {
          flatPixels++;
        }
      }
      const coverage = flatPixels / (frame.length / 4);

      // STRONG BLOCK detection
      const isStrongBlock =
        avgBrightness < 15 ||      // almost black
        variance < 40 ||           // extremely uniform
        sharpness < 120 ||         // almost no edges
        coverage > 0.75;           // almost fully flat

      // PRIORITY RULE:
      // If face is missing AND camera is NOT strongly blocked → it's NOT a camera block
      if (!faceDetected && !isStrongBlock) {
        setCameraBlocked(false);
        return;
      }

      // Otherwise, cameraBlocked = strong block
      setCameraBlocked(isStrongBlock);

    }, 500);

    return () => clearInterval(interval);
  }, [videoRef, faceDetected]);

  return cameraBlocked;
}
