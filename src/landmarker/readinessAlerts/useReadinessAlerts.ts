import type { ReadinessAlertType } from "./alertTypesReadiness";
import { useCameraOff } from "../analysis/useCameraOff";
import { useCameraReady } from "../analysis/useCameraReady";
import { useCameraBlocked } from "../analysis/useCameraBlocked";
import { useFrameFrozen } from "../analysis/useFrameFrozen";
import { useLightingQuality } from "../analysis/useLightingQuality";
import { analyzeFacePresence } from "../analysis/analyzeFacePresence";
import { useFaceStability } from "../analysis/useFaceStability";
import { analyzeCalibration } from "../analysis/useCalibration";

export function useReadinessAlerts(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  faceLandmarks: any
) {
  const alerts: ReadinessAlertType[] = [];

  // cast once for old hooks
  const videoRefNonNull = videoRef as React.RefObject<HTMLVideoElement>;

  // 1. CAMERA SIGNALS
  const cameraOff = useCameraOff(videoRefNonNull);
  const cameraReady = useCameraReady(videoRefNonNull);
  const cameraBlocked = useCameraBlocked(videoRefNonNull, false);
  const frameFrozen = useFrameFrozen(videoRefNonNull);
  const lighting = useLightingQuality(videoRefNonNull);

  if (cameraOff) alerts.push("CAMERA_OFF");
  if (!cameraOff && !cameraReady) alerts.push("CAMERA_PERMISSION_DENIED");
  if (cameraBlocked) alerts.push("CAMERA_BLOCKED");
  if (frameFrozen) alerts.push("FRAME_FROZEN");
  if (lighting !== "good") alerts.push("LOW_LIGHTING");

  // 2. FACE PRESENCE + STABILITY
  const face = analyzeFacePresence(faceLandmarks);

  if (!face.faceDetected) alerts.push("NO_FACE");
  if (face.faceDetected && !face.stable) alerts.push("FRAME_QUALITY_LOW");

  // 3. FACE JITTER
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
