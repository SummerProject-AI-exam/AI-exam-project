import { useMemo } from "react";
import type { AlertType } from "./alertTypes";

interface RawAlertInput {
  faceCount: number;
  cameraReady: boolean;
  cameraBlocked: boolean;
  cameraOff: boolean;
  
  cameraPermissionDenied: boolean;
  cameraStreamFailed: boolean;
  cameraImageBlack: boolean;
  cameraImageFrozen: boolean;
}

export function useRawAlerts({
  faceCount,
  cameraReady,
  cameraBlocked,
  cameraOff,
  cameraPermissionDenied,
  cameraStreamFailed,
  cameraImageBlack,
  cameraImageFrozen,
}: RawAlertInput): AlertType | null {
  return useMemo(() => {
   
    if (cameraPermissionDenied) return "CAMERA_PERMISSION_DENIED";
    if (cameraOff) return "CAMERA_OFF";
    if (cameraStreamFailed) return "CAMERA_STREAM_FAILED";

    
    if (cameraImageBlack) return "CAMERA_IMAGE_BLACK";
    if (cameraImageFrozen) return "CAMERA_IMAGE_FROZEN";


    if (!cameraReady) return "CAMERA_NOT_READY";

    
    if (cameraBlocked) return "CAMERA_BLOCKED";

    
    if (faceCount === 0) return "NO_FACE";
    if (faceCount > 1) return "MULTIPLE_FACES";

    return null;
  }, [
    faceCount,
    cameraReady,
    cameraBlocked,
    cameraOff,
    cameraPermissionDenied,
    cameraStreamFailed,
    cameraImageBlack,
    cameraImageFrozen,
  ]);
}
