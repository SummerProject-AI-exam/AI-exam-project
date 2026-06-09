import type { ReadinessAlertType } from "./alertTypesReadiness";

import { analyzeFacePresence } from "../analysis/analyzeFacePresence";
import { useFaceStability } from "../analysis/useFaceStability";
import { analyzeCalibration } from "../analysis/useCalibration";

type ReadinessInput = {
  videoRef: React.RefObject<HTMLVideoElement>;
  faceLandmarks: any[];
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
    cameraReady,
    cameraBlocked,
    cameraOff,
    frameFrozen,
    lighting,
  } = input;

  const alerts: ReadinessAlertType[] = [];

  if (cameraOff) alerts.push("CAMERA_OFF");
  if (!cameraOff && !cameraReady) alerts.push("CAMERA_PERMISSION_DENIED");
  if (cameraBlocked) alerts.push("CAMERA_BLOCKED");
  if (frameFrozen) alerts.push("FRAME_FROZEN");
  if (lighting !== "good") alerts.push("LOW_LIGHTING");

  const face = analyzeFacePresence(faceLandmarks);

  if (!face.faceDetected) alerts.push("NO_FACE");

  if (face.faceDetected && !face.stable) alerts.push("FRAME_QUALITY_LOW");

  const faceUnstable = useFaceStability(faceLandmarks);
  if (faceUnstable) alerts.push("FRAME_QUALITY_LOW");

  const calibration = analyzeCalibration({
    faceDetected: face.faceDetected,
    stable: face.stable,
  });

  if (!calibration.calibrated) alerts.push("CALIBRATION_NOT_READY");

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
