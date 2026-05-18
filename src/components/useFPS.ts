import { useRef, useState } from "react";

export function useFPS() {
  const [fps, setFps] = useState(0);

  const lastTimeRef = useRef(performance.now());
  const framesRef = useRef(0);

  const updateFPS = () => {
    framesRef.current++;
    const now = performance.now();

    if (now - lastTimeRef.current >= 1000) {
      setFps(framesRef.current);
      framesRef.current = 0;
      lastTimeRef.current = now;
    }
  };

  return { fps, updateFPS };
}
