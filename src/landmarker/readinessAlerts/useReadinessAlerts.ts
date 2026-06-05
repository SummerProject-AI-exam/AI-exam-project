import type { ReadinessAlertType } from "./alertTypesReadiness";

// Your real signals
import { useCameraOff } from "../analysis/useCameraOff";
import { useCameraBlocked } from "../analysis/useCameraBlocked";
import { useCameraReady } from "../analysis/useCameraReady";
import { useFaceStability } from "../analysis/useFaceStability";
import { useFrameFrozen } from "../analysis/useFrameFrozen";
import { useLightingQuality } from "../analysis/useLightingQuality";

// Your analyzers (not hooks)
import { analyzeFacePresence } from "../analysis/analyzeFacePresence";
import { analyzeCalibration } from "../analysis/useCalibration";

export function useReadinessAlerts(videoRef: React.RefObject<HTMLVideoElement>, faceLandmarks: any) {
  const alerts: ReadinessAlertType[] = [];

  //
  // 1. CAMERA SIGNALS
  //
  const cameraOff = useCameraOff(videoRef);
  const cameraReady = useCameraReady(videoRef);
  const cameraBlocked = useCameraBlocked(videoRef, /* faceDetected */ false); // updated later
  const frameFrozen = useFrameFrozen(videoRef);
  const lighting = useLightingQuality(videoRef);

  if (cameraOff) alerts.push("CAMERA_OFF");
  if (!cameraOff && !cameraReady) alerts.push("CAMERA_PERMISSION_DENIED");
  if (cameraBlocked) alerts.push("CAMERA_BLOCKED");
  if (frameFrozen) alerts.push("FRAME_FROZEN");
  if (lighting !== "good") alerts.push("LOW_LIGHTING");

  //
  // 2. FACE PRESENCE + STABILITY
  //
  const face = analyzeFacePresence(faceLandmarks);

  if (!face.faceDetected) alerts.push("NO_FACE");
  if (face.faceDetected && !face.stable) alerts.push("FRAME_QUALITY_LOW");

  //
  // 3. FACE JITTER (motion instability)
  //
  const faceUnstable = useFaceStability(faceLandmarks);
  if (faceUnstable) alerts.push("FRAME_QUALITY_LOW");

  //
  // 4. CALIBRATION
  //
  const calibration = analyzeCalibration({
    faceDetected: face.faceDetected,
    stable: face.stable,
  });

  if (!calibration.calibrated) alerts.push("CALIBRATION_NOT_READY");

  //
  // 5. READY STATE
  //
  if (alerts.length === 0) {
    alerts.push("READY");
  }

  return {
    ok: alerts.length === 1 && alerts[0] === "READY",
    alerts,
  };
}
