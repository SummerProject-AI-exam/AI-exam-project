import { useEffect, useRef } from "react";
import { logFraudEvent } from "../alerts/logFraudEvent";

type Direction = "CENTER" | "LEFT" | "RIGHT" | "UP" | "DOWN" | "NONE";

type Monitoring = {
  valid: boolean;
  direction: Direction;
  drift: number;
};

type DebugGaze = {
  stability: number;
  confidence: number;
  vectorMagnitude: number;
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
  debug: DebugGaze,
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

  const normalDown =
      monitoring.direction === "DOWN" &&
      monitoring.drift < baseline.centerY * 1.2 &&
      debug.confidence > 0.5;

    const suspiciousDown =
      monitoring.direction === "DOWN" &&
      monitoring.drift > baseline.verticalThreshold &&
      debug.confidence > 0.5;

    const extremeDown =
      monitoring.direction === "DOWN" &&
      monitoring.drift > baseline.verticalThreshold * 1.8 &&
      debug.confidence > 0.5;

    const lookingAway =
      monitoring.direction === "LEFT" ||
      monitoring.direction === "RIGHT";

    const suspiciousUp =
      monitoring.direction === "UP" &&
      monitoring.drift > baseline.verticalThreshold &&
      debug.confidence > 0.5;

    const driftTooHigh =
      monitoring.drift > baseline.driftThreshold;

    const unstable =
      debug.stability < 0.2;

   
    const eyesCovered =
      debug.confidence < 0.3;

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
    debug.stability,
    debug.confidence,
    baseline?.verticalThreshold,
    baseline?.driftThreshold,
    baseline?.centerY,
    sessionId
  ]);
}
