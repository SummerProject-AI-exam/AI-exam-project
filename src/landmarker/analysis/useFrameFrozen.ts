import { useEffect, useRef, useState } from "react";

export function useFrameFrozen(videoRef: React.RefObject<HTMLVideoElement>) {
  const [isFrozen, setIsFrozen] = useState(false);

  const lastHashRef = useRef<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const video = videoRef.current;
      if (!video) return;

      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, 32, 32);
      const frame = ctx.getImageData(0, 0, 32, 32).data;

      let hash = 0;
      for (let i = 0; i < frame.length; i++) {
        hash = (hash + frame[i]) % 100000;
      }

      if (lastHashRef.current !== null && lastHashRef.current === hash) {
        setIsFrozen(true);
      } else {
        setIsFrozen(false);
      }

      lastHashRef.current = hash;
    }, 500);

    return () => clearInterval(interval);
  }, [videoRef]);

  return isFrozen;
}
