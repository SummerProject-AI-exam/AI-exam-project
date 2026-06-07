import type { ReadinessAlertType } from "./alertTypesReadiness";

import { analyzeFacePresence } from "../analysis/analyzeFacePresence";
import { useFaceStability } from "../analysis/useFaceStability";
import { analyzeCalibration } from "../analysis/useCalibration";

type ReadinessInput = {
  videoRef: React.RefObject<HTMLVideoElement>;
  faceLandmarks: any[];
  faceCount: number;

  // Phase 2 signals reused
  cameraReady: boolean;
  cameraBlocked: boolean;
  cameraOff: boolean;

  // Phase 1 signals
  frameFrozen: boolean;
  lighting: "good" | "bad" | "dark" | string;
};

export function useReadinessAlerts(input: ReadinessInput) {
  const {
    videoRef,
    faceLandmarks,
    faceCount,
    cameraReady,
    cameraBlocked,
    cameraOff,
    frameFrozen,
    lighting,
  } = input;

  const alerts: ReadinessAlertType[] = [];

  // 1. CAMERA SIGNALS
  if (cameraOff) alerts.push("CAMERA_OFF");
  if (!cameraOff && !cameraReady) alerts.push("CAMERA_PERMISSION_DENIED");
  if (cameraBlocked) alerts.push("CAMERA_BLOCKED");
  if (frameFrozen) alerts.push("FRAME_FROZEN");
  if (lighting !== "good") alerts.push("LOW_LIGHTING");

  // 2. FACE PRESENCE + STABILITY
  const face = analyzeFacePresence(faceLandmarks);

  if (!face.faceDetected) alerts.push("NO_FACE");
  if (face.faceDetected && !face.stable) alerts.push("FRAME_QUALITY_LOW");

  // 3. FACE JITTER (extra stability check)
  const faceUnstable = useFaceStability(faceLandmarks);
  if (faceUnstable) alerts.push("FRAME_QUALITY_LOW");

  // 4. CALIBRATION
  const calibration = analyzeCalibration({
    faceDetected: face.faceDetected,
    stable: face.stable,
  });

  if (!calibration.calibrated) alerts.push("CALIBRATION_NOT_READY");

  // 5. READY STATE
  if (alerts.length === 0) {
    alerts.push("READY");
  }

  return {
    ok: alerts.length === 1 && alerts[0] === "READY",
    alerts,
  };
}
