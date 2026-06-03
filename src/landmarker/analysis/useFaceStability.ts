import { useState, useEffect } from "react";

export function useFaceStability(landmarks: { x: number; y: number }[] | null) {
  const [unstable, setUnstable] = useState(false);
  let lastCenter = { x: 0, y: 0 };

  useEffect(() => {
    if (!landmarks || landmarks.length === 0) {
      setUnstable(false);
      return;
    }

    const cx = landmarks.reduce((s, p) => s + p.x, 0) / landmarks.length;
    const cy = landmarks.reduce((s, p) => s + p.y, 0) / landmarks.length;

    const dx = Math.abs(cx - lastCenter.x);
    const dy = Math.abs(cy - lastCenter.y);

    if (dx > 0.02 || dy > 0.02) setUnstable(true);
    else setUnstable(false);

    lastCenter = { x: cx, y: cy };
  }, [landmarks]);

  return unstable;
}
