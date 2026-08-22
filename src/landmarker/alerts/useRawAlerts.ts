import { useMemo, useRef } from "react";
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

  const now = Date.now();
  // delays before triggering alerts
  const startTimeRef = useRef(now);
  const startupDelayPassed = now - startTimeRef.current > 300;

  const lastFaceSeenRef = useRef(now);
  if (faceCount > 0) lastFaceSeenRef.current = now;
  const noFaceStable = faceCount === 0 && now - lastFaceSeenRef.current > 200;

  const lastReadyRef = useRef(now);
  if (cameraReady) lastReadyRef.current = now;
  const notReadyStable = !cameraReady && now - lastReadyRef.current > 300;

  const lastOnRef = useRef(now);
  if (!cameraOff) lastOnRef.current = now;
  const offStable = cameraOff && now - lastOnRef.current > 300;


  return useMemo(() => {

    if (cameraBlocked) return "CAMERA_BLOCKED";

    if (offStable) return "CAMERA_OFF";

    if (notReadyStable) return "CAMERA_NOT_READY";

    if (
      cameraReady &&
      !cameraBlocked &&
      !cameraOff &&
      !startupDelayPassed &&
      faceCount === 0
    ) {
      return "CAMERA_READY";
    }

    if (faceCount > 1) return "MULTIPLE_FACES";

    if (
      cameraReady &&
      !cameraBlocked &&
      !cameraOff &&
      startupDelayPassed &&
      noFaceStable
    ) {
      return "NO_FACE";
    }

    if (faceCount === 1) return "OK";

    return null;
  }, [
    faceCount,
    cameraBlocked,
    offStable,
    notReadyStable,
    noFaceStable,
    startupDelayPassed,
    cameraReady,
    cameraOff,
  ]);
}
