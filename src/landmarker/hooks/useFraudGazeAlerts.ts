import { useEffect, useRef } from "react";
import { logFraudEvent } from "../alerts/logFraudEvent";

type Direction = "CENTER" | "LEFT" | "RIGHT" | "UP" | "DOWN" | "NONE";

type Monitoring = {
  valid: boolean;
  direction: Direction;
  drift: number;
};

type Baseline = {
  x: number;
  y: number;
  centerX: number;
  centerY: number;
  horizontalThreshold: number;
  verticalThreshold: number;
  driftThreshold: number;
  stabilized?: boolean;
} | null;

export function useFraudGazeAlerts(
  monitoring: Monitoring,
  gazeFrame: {
    stable: boolean;
    confidence: number;
    vectorMagnitude: number;
  },
  baseline: Baseline,
  sessionId: string
) {
  const suspiciousStart = useRef<number | null>(null);
  const fraudTriggered = useRef<boolean>(false);
  const safeReturnStart = useRef<number | null>(null);

  useEffect(() => {
    if (!baseline) return;
    if (!monitoring.valid) return;

    const now = performance.now();

    // ⭐ Map new gazeFrame fields
    const stability = gazeFrame.stable ? 1 : 0;
    const confidence = gazeFrame.confidence;
    const magnitude = gazeFrame.vectorMagnitude;

    // ---------- DOWN LOOKING ----------
    const normalDown =
      monitoring.direction === "DOWN" &&
      monitoring.drift < baseline.centerY * 1.2 &&
      confidence > 0.5;

    const suspiciousDown =
      monitoring.direction === "DOWN" &&
      monitoring.drift > baseline.verticalThreshold &&
      confidence > 0.5;

    const extremeDown =
      monitoring.direction === "DOWN" &&
      monitoring.drift > baseline.verticalThreshold * 1.8 &&
      confidence > 0.5;

    // ---------- LEFT / RIGHT ----------
    const lookingAway =
      monitoring.direction === "LEFT" ||
      monitoring.direction === "RIGHT";

    // ---------- UP ----------
    const suspiciousUp =
      monitoring.direction === "UP" &&
      monitoring.drift > baseline.verticalThreshold &&
      confidence > 0.5;

    // ---------- DRIFT ----------
    const driftTooHigh =
      monitoring.drift > baseline.driftThreshold;

    // ---------- STABILITY ----------
    const unstable =
      stability < 0.2;

    // ---------- EYES COVERED ----------
    const eyesCovered =
      confidence < 0.3;

    // ---------- SUSPICIOUS CONDITIONS ----------
    const suspicious =
      suspiciousDown ||
      extremeDown ||
      suspiciousUp ||
      lookingAway ||
      driftTooHigh ||
      unstable ||
      eyesCovered;

    if (suspicious) {
      safeReturnStart.current = null;

      if (suspiciousStart.current === null) {
        suspiciousStart.current = now;
      }

      const duration = now - suspiciousStart.current;

      if (duration > 3000 && !fraudTriggered.current) {
        logFraudEvent({
          sessionId,
          eventType: `Fraud_Gaze_${monitoring.direction}`,
        });

        fraudTriggered.current = true;
      }
    } else {
      if (normalDown) return;

      if (safeReturnStart.current === null) {
        safeReturnStart.current = now;
      }

      const safeDuration = now - safeReturnStart.current;

      if (safeDuration > 1500) {
        suspiciousStart.current = null;
        fraudTriggered.current = false;
      }
    }
  }, [
    monitoring.valid,
    monitoring.direction,
    monitoring.drift,
    gazeFrame.stable,
    gazeFrame.confidence,
    gazeFrame.vectorMagnitude,
    baseline?.verticalThreshold,
    baseline?.driftThreshold,
    baseline?.centerY,
    sessionId
  ]);
}
