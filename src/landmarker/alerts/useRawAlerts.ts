import { useMemo } from "react";
import type { AlertType } from "./alertTypes";

interface RawAlertInput {
  faceCount: number;
  cameraReady: boolean;
  cameraBlocked: boolean;
  cameraOff: boolean;

  poseTooLeft: boolean;
  poseTooRight: boolean;
  poseTooDown: boolean;
  poseTooUp: boolean;
}


export function useRawAlerts({
  faceCount,
  cameraReady,
  cameraBlocked,
  cameraOff,
  poseTooLeft,
  poseTooRight,
  poseTooDown,
  poseTooUp,
}: RawAlertInput): AlertType | null {

  return useMemo(() => {
    if (cameraOff) return "CAMERA_OFF";
    if (!cameraReady) return "CAMERA_NOT_READY";

    if (cameraBlocked) return "CAMERA_BLOCKED";

    if (faceCount === 0) return "NO_FACE";
    if (faceCount > 1) return "MULTIPLE_FACES";

    if (poseTooLeft) return "POSE_TOO_LEFT";
    if (poseTooRight) return "POSE_TOO_RIGHT";
    if (poseTooDown) return "POSE_TOO_DOWN";
    if (poseTooUp) return "POSE_TOO_UP";

    return null;


  }, [
  faceCount,
  cameraReady,
  cameraBlocked,
  cameraOff,
  poseTooLeft,
  poseTooRight,
  poseTooDown,
  poseTooUp
]);

}