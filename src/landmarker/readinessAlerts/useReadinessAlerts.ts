import type { ReadinessAlertType } from "./alertTypesReadiness";

type ReadinessInput = {
  videoRef: React.RefObject<HTMLVideoElement>;
  faceLandmarks: any[] | null;
  faceCount: number;

  cameraReady: boolean;
  cameraBlocked: boolean;
  cameraOff: boolean;

  frameFrozen: boolean;
  lighting: "good" | "bad" | "dark" | string;
};

export function useReadinessAlerts(input: ReadinessInput) {
  const {
    faceLandmarks,
    faceCount,
    cameraReady,
    cameraBlocked,
    cameraOff,
    frameFrozen,
    lighting,
  } = input;

  const alerts: ReadinessAlertType[] = [];

  // --- CAMERA STATUS ---
  if (cameraOff) alerts.push("CAMERA_OFF");
  if (!cameraOff && !cameraReady) alerts.push("CAMERA_PERMISSION_DENIED");
  if (cameraBlocked) alerts.push("CAMERA_BLOCKED");

  // --- FRAME STATUS ---
  if (frameFrozen) alerts.push("FRAME_FROZEN");
  if (lighting !== "good") alerts.push("LOW_LIGHTING");

  // --- FACE PRESENCE ---
  const faceDetected = faceCount > 0 && faceLandmarks && faceLandmarks.length > 0;
  if (!faceDetected) alerts.push("NO_FACE");

  // --- FACE QUALITY ---
  // Simple stability check: landmarks must not be null and must have enough points
  const hasEnoughPoints =
    faceDetected && faceLandmarks[0] && faceLandmarks[0].length > 20;

  if (faceDetected && !hasEnoughPoints) {
    alerts.push("FRAME_QUALITY_LOW");
  }

  // --- CALIBRATION ---
  // Calibration is now simple: face must be detected + stable enough
  const calibrated = faceDetected && hasEnoughPoints;
  if (!calibrated) alerts.push("CALIBRATION_NOT_READY");

  // --- FINAL STATE ---
  const TEMPORARY_ALERTS = [
    "NO_FACE",
    "CAMERA_BLOCKED",
    "FRAME_FROZEN",
    "LOW_LIGHTING",
    "FRAME_QUALITY_LOW",
    "CALIBRATION_NOT_READY",
  ];

  const CRITICAL_ALERTS = [
    "CAMERA_OFF",
    "CAMERA_PERMISSION_DENIED",
  ];

  const hasCritical = alerts.some(a => CRITICAL_ALERTS.includes(a));
  const hasTemporary = alerts.some(a => TEMPORARY_ALERTS.includes(a));

  if (!hasCritical && !hasTemporary) {
    return {
      ok: true,
      alerts: ["READY"],
    };
  }

  if (hasCritical) {
    return {
      ok: false,
      alerts,
    };
  }

  return {
    ok: false,
    alerts,
  };
}
