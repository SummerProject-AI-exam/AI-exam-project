import { useMemo } from "react";

export function useDistance(results: any): "close" | "far" | "normal" {
  return useMemo(() => {
    if (!results || !results.faceLandmarks || results.faceLandmarks.length !== 1) {
      return "normal";
    }

    const lm = results.faceLandmarks[0];
    const top = lm[10];
    const bottom = lm[152];

    if (!top || !bottom) return "normal";

    const faceHeight = Math.abs(bottom.y - top.y);

    // TEMPORARY thresholds for tomorrow's demo
    // Less sensitive "close"
    if (faceHeight > 0.52) return "close";

    // More realistic "far"
    if (faceHeight < 0.22) return "far";

    return "normal";
  }, [results]);
}
