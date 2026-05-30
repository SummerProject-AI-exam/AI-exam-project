import { useMemo } from "react";

// smoothing buffer
const distanceBuffer: number[] = [];
const MAX_BUFFER = 6;

function getSmoothed(value: number): number {
  distanceBuffer.push(value);

  if (distanceBuffer.length > MAX_BUFFER) {
    distanceBuffer.shift();
  }

  const sum = distanceBuffer.reduce((a, b) => a + b, 0);
  return sum / distanceBuffer.length;
}

export function useDistance(results: any): "close" | "far" | "normal" {
  return useMemo(() => {
    if (!results || !results.faceLandmarks || results.faceLandmarks.length !== 1) {
      return "normal";
    }

    const lm = results.faceLandmarks[0];
    const top = lm[10];
    const bottom = lm[152];

    if (!top || !bottom) return "normal";

    // RAW value
    const faceHeightRaw = Math.abs(bottom.y - top.y);


    // ⭐ Apply smoothing
    const faceHeight = getSmoothed(faceHeightRaw);

    // TEMPORARY thresholds for demo
    if (faceHeight > 0.52) return "close";
    if (faceHeight < 0.22) return "far";

    return "normal";
  }, [results]);
}
