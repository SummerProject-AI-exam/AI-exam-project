import { useState, useEffect } from "react";

export function useLightingQuality(videoRef: React.RefObject<HTMLVideoElement>) {
  const [lighting, setLighting] = useState<"good" | "dark" | "bright">("good");

  useEffect(() => {
    const interval = setInterval(() => {
      const video = videoRef.current;
      if (!video) return;

      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, 64, 64);
      const frame = ctx.getImageData(0, 0, 64, 64).data;

      let total = 0;
      for (let i = 0; i < frame.length; i += 4) {
        const r = frame[i];
        const g = frame[i + 1];
        const b = frame[i + 2];
        total += (r + g + b) / 3;
      }

      const avg = total / (64 * 64);

      if (avg < 40) setLighting("dark");
      else if (avg > 200) setLighting("bright");
      else setLighting("good");
    }, 500);

    return () => clearInterval(interval);
  }, [videoRef]);

  return lighting;
}
