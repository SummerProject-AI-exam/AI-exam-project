import { useMemo } from "react";
import type { AlertType } from "./alertTypes";

interface RawAlertInput {
  faceCount: number;
  cameraReady: boolean;     
  cameraBlocked: boolean;   
  cameraOff: boolean;       
  distanceStatus: "close" | "far" | "normal";
}

export function useRawAlerts({
  faceCount,
  cameraReady,
  cameraBlocked,
  cameraOff,
  distanceStatus,
}: RawAlertInput): AlertType | null {
  return useMemo(() => {
    // 1. Camera truly OFF (no frames at all)
    if (cameraOff) return "CAMERA_OFF";

    // 2. Camera not yet producing frames
    if (!cameraReady) return "CAMERA_NOT_READY";

    // 3. Camera frozen / covered / stuck
    if (cameraBlocked) return "CAMERA_BLOCKED";

    // 4. Distance alerts (only when exactly one face)
    if (faceCount === 1) {
      if (distanceStatus === "close") return "TOO_CLOSE";
      if (distanceStatus === "far") return "TOO_FAR";
    }

    // 5. Face presence
    if (faceCount === 0) return "NO_FACE";
    if (faceCount > 1) return "MULTIPLE_FACES";

    return null;
  }, [faceCount, cameraReady, cameraBlocked, cameraOff, distanceStatus]);
}
