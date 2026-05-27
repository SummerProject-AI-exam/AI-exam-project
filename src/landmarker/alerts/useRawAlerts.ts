import { useMemo } from "react";
import type { AlertType } from "./alertTypes";

interface RawAlertInput {
  faceCount: number;
  cameraReady: boolean;
  cameraBlocked: boolean;
  cameraOff: boolean;
  distanceStatus: "close" | "far" | "normal";   // <-- ADD THIS
}

export function useRawAlerts({
  faceCount,
  cameraReady,
  cameraBlocked,
  cameraOff,
  distanceStatus,   // <-- ADD THIS
}: RawAlertInput): AlertType | null {
  return useMemo(() => {
    if (cameraOff) return "CAMERA_OFF";
    if (!cameraReady) return "CAMERA_NOT_READY";
    if (cameraBlocked) return "CAMERA_BLOCKED";

    // Distance alerts FIRST
    if (faceCount === 1) {
      if (distanceStatus === "close") return "TOO_CLOSE";
      if (distanceStatus === "far") return "TOO_FAR";
    }

    // Face presence AFTER distance
    if (faceCount === 0) return "NO_FACE";
    if (faceCount > 1) return "MULTIPLE_FACES";

    return null;
  }, [
    faceCount,
    cameraReady,
    cameraBlocked,
    cameraOff,
    distanceStatus,   // <-- ADD THIS
  ]);
}