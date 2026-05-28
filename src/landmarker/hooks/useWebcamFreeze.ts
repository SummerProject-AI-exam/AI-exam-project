import { useEffect, useState } from "react";

export function useWebcamFreeze(
  videoRef: React.RefObject<HTMLVideoElement | null>
) {
  const [isFrozen, setIsFrozen] = useState(false);

  useEffect(() => {
    let lastTime = -1;
    let lastUpdate = performance.now();

    const check = () => {
      const video = videoRef.current;

      if (video && video.readyState >= 2 && !video.paused && !video.ended) {
        const current = video.currentTime;

        if (current !== lastTime) {
          lastTime = current;
          lastUpdate = performance.now();
          setIsFrozen(false);
        } else {
          if (performance.now() - lastUpdate > 4000) {
            setIsFrozen(true);
          }
        }
      }

      requestAnimationFrame(check);
    };

    check();
  }, [videoRef]);

  return isFrozen;
}
