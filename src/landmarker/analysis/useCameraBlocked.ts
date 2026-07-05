import { useEffect, useState, useRef } from "react";

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
): boolean {
  const [cameraBlocked, setCameraBlocked] = useState<boolean>(false);

  const blockCounter = useRef<number>(0);
  const BLOCK_THRESHOLD = 2;

  useEffect(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const interval = setInterval(() => {
      const video = videoRef.current;
      if (!video || !ctx) {
        setCameraBlocked(false);
        return;
      }

      // 🔥 Stabilizer 1 — camera not ready
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        setCameraBlocked(false);
        return;
      }

      // 🔥 Stabilizer 2 — NO_FACE should NOT become CAMERA_BLOCKED
      if (!faceDetected) {
        blockCounter.current = 0;
        setCameraBlocked(false);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const frame = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

      let sum = 0;
      for (let i = 0; i < frame.length; i += 4) {
        const r = frame[i];
        const g = frame[i + 1];
        const b = frame[i + 2];
        sum += (r + g + b) / 3;
      }
      const avgBrightness = sum / (frame.length / 4);

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

        if (v < 10 || v > 245) {
          flatPixels++;
        }
      }
      const coverage = flatPixels / (frame.length / 4);

      const isStrongBlock =
        avgBrightness < 15 ||
        variance < 40 ||
        sharpness < 20 ||
        coverage > 0.90;

      if (!isStrongBlock) {
        blockCounter.current = 0;
        setCameraBlocked(false);
        return;
      }

      blockCounter.current++;
      setCameraBlocked(blockCounter.current >= BLOCK_THRESHOLD);
    }, 100);

    return () => clearInterval(interval);
  }, [videoRef, faceDetected]);

  return cameraBlocked;
}
