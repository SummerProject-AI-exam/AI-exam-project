import { useEffect, useRef, useState } from "react";
import type { GazeAlertType } from "./alertTypesGaze";

interface GazeData {
  direction: "CENTER" | "LEFT" | "RIGHT" | "UP" | "DOWN";
  stability: number;
  valid: boolean;
  drift: number;        
  confidence: number;   
}

export function useGazeAlerts(
  data: GazeData,
  monitoringActive: boolean
): GazeAlertType | null {
  const [alert, setAlert] = useState<GazeAlertType | null>(null);
  const lastAlert = useRef<GazeAlertType | null>(null);

  const invalidCount = useRef(0);
  const stableFrames = useRef(0);
  const safeReturnStart = useRef<number | null>(null);

  useEffect(() => {
    const { direction, valid, stability, drift, confidence } = data;

    if (!monitoringActive) {
      invalidCount.current = 0;
      stableFrames.current = 0;
      safeReturnStart.current = null;
      lastAlert.current = null;
      setAlert(null);
      return;
    }

    // ---------- EYES COVERED ----------
    const INVALID_DEBOUNCE = 3;

    if (!valid || confidence < 0.3) {
      invalidCount.current += 1;

      if (invalidCount.current >= INVALID_DEBOUNCE) {
        if (lastAlert.current !== "EYES_COVERED") {
          lastAlert.current = "EYES_COVERED";
          setAlert("EYES_COVERED");
        }
      }

      return;
    }

    invalidCount.current = 0;

    // ---------- STABILITY GATING ----------
    if (stability >= 0.4) {
      stableFrames.current += 1;
    } else {
      stableFrames.current = 0;
    }

    if (stableFrames.current < 2) {
      return; // not stable enough for UI alert
    }

    // ---------- DIRECTION ALERTS WITH DRIFT GATING ----------
    let newAlert: GazeAlertType | null = null;

    // LEFT / RIGHT
    if (direction === "LEFT") newAlert = "LOOKING_AWAY_LEFT";
    else if (direction === "RIGHT") newAlert = "LOOKING_AWAY_RIGHT";

    // UP (only meaningful drift)
    else if (direction === "UP" && drift > 0.15) {
      newAlert = "LOOKING_AWAY_UP";
    }

    // DOWN (normal keyboard-down suppressed)
    else if (direction === "DOWN") {
      if (drift > 0.18) {
        newAlert = "LOOKING_AWAY_DOWN";
      } else {
        newAlert = null; // normal keyboard-down
      }
    }

    // CENTER
    else {
      newAlert = null;
    }

    // ---------- SAFE RETURN WINDOW ----------
    if (newAlert === null) {
      if (safeReturnStart.current === null) {
        safeReturnStart.current = performance.now();
      }

      const safeDuration = performance.now() - safeReturnStart.current;

      if (safeDuration > 300) {
        if (lastAlert.current !== null) {
          lastAlert.current = null;
          setAlert(null);
        }
      }

      return;
    }

    safeReturnStart.current = null;

    // ---------- UPDATE ALERT ----------
    if (newAlert !== lastAlert.current) {
      lastAlert.current = newAlert;
      setAlert(newAlert);
    }
  }, [
    data.direction,
    data.valid,
    data.stability,
    data.drift,
    data.confidence,
    monitoringActive
  ]);

  return alert;
}
