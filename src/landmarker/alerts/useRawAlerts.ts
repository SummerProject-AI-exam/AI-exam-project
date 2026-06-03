import { useMemo } from "react";
import type { AlertType } from "./alertTypes";

interface RawAlertInput {
  faceCount: number;
  cameraReady: boolean;
  cameraBlocked: boolean;
  cameraOff: boolean;
}

export function useRawAlerts({
  faceCount,
  cameraReady,
  cameraBlocked,
  cameraOff,
}: RawAlertInput): AlertType | null {
  return useMemo(() => {
    if (cameraOff) return "CAMERA_OFF";
    if (!cameraReady) return "CAMERA_NOT_READY";

    if (cameraBlocked) return "CAMERA_BLOCKED";

    if (faceCount === 0) return "NO_FACE";
    if (faceCount > 1) return "MULTIPLE_FACES";

    return null;


  }, [faceCount, cameraReady, cameraBlocked, cameraOff]);
}