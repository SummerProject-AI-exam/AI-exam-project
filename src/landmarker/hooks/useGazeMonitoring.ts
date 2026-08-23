import { useRef } from "react";
import type { ProcessedGaze, Direction } from "./useGazeProcessor";

const CENTER_RADIUS = 0.22;
const DIRECTION_CONFIRMATION = 4;

export function useGazeMonitoring(
  gaze: ProcessedGaze
): {
  valid: boolean;
  centered: boolean;
  direction: Direction;
  drift: number;
} {
  const stableDir = useRef<Direction>("CENTER");
  const stableCount = useRef(0);

  if (!gaze.valid) {
    return {
      valid: false,
      centered: false,
      direction: "CENTER",
      drift: 0,
    };
  }

  const { dx, dy, drift, centered } = gaze;

  if (centered || drift < CENTER_RADIUS) {
    stableDir.current = "CENTER";
    stableCount.current = 0;

    return {
      valid: true,
      centered: true,
      direction: "CENTER",
      drift,
    };
  }

  let direction: Direction = "CENTER";

  if (Math.abs(dx) >= Math.abs(dy)) {
    direction = dx > 0 ? "RIGHT" : "LEFT";
  } else {
    direction = dy > 0 ? "DOWN" : "UP";
  }

  if (direction === stableDir.current) {
    stableCount.current += 1;
  } else {
    stableDir.current = direction;
    stableCount.current = 1;
  }

  const finalDirection =
    stableCount.current >= DIRECTION_CONFIRMATION
      ? stableDir.current
      : "CENTER";

  return {
    valid: true,
    centered: false,
    direction: finalDirection,
    drift,
  };
}
