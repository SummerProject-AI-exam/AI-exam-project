import { useRef } from "react";

export function useDistance() {
  const baselineZ = useRef<number | null>(null);

  function getStatus(z: number | null) {
    if (z == null) return "normal";

    // Initialize baseline when first face appears
    if (baselineZ.current === null) {
      baselineZ.current = z;
      return "normal";
    }

    const base = baselineZ.current;

    // Compare relative change
    const ratio = z / base;

    if (ratio > 1.20) return "close";   // 20% closer
    if (ratio < 0.80) return "far";     // 20% farther

    return "normal";
  }

  return { getStatus };
}