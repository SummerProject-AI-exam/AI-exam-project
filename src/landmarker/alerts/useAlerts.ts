import { useEffect, useRef } from "react";
import { useRawAlerts } from "./useRawAlerts";
import { useStableAlert } from "./useStableAlerts";
import type { AlertState, AlertType } from "./alertTypes";
import { logFraudEvent } from "../alerts/logFraudEvent";

interface AlertInput {
  faceCount: number;
  cameraReady: boolean;
  cameraBlocked: boolean;
  cameraOff: boolean;
}

const FRAUD_TYPES = new Set([
  "CAMERA_BLOCKED",
  "CAMERA_OFF",
  "CHEATING",
  "MULTIPLE_FACES",
  "FACE_OFF",
]);

export function useAlerts(input: AlertInput, sessionId: string): AlertState | null {
  const rawAlert: AlertType | null = useRawAlerts(input);
  const stableAlert = useStableAlert(rawAlert, 300);

  const lastRawRef = useRef<AlertType | null>(null);
  const lastStableRef = useRef<AlertType | null>(null);

  if (rawAlert !== lastRawRef.current) {
    console.log("RAW ALERT CHANGED:", rawAlert);
    lastRawRef.current = rawAlert;
  }

  if (stableAlert?.type !== lastStableRef.current) {
    console.log("STABLE ALERT CHANGED:", stableAlert);
    lastStableRef.current = stableAlert?.type ?? null;
  }

  const prevAlertTypeRef = useRef<AlertType | null>(null);
  const readyTimestampRef = useRef<number | null>(null);

  useEffect(() => {
    const { cameraReady } = input;

    // CAMERA_READY should be a stable alert
    if (cameraReady && !readyTimestampRef.current) {
      readyTimestampRef.current = Date.now();
    }

    if (!stableAlert) {
      prevAlertTypeRef.current = null;
      return;
    }

    const eventType = stableAlert.type;

    // Prevent CAMERA_OFF immediately after CAMERA_READY
    const now = Date.now();
    if (
      cameraReady &&
      eventType === "CAMERA_OFF" &&
      readyTimestampRef.current &&
      now - readyTimestampRef.current < 500
    ) {
      return;
    }

    // Only fire when alert type changes
    if (prevAlertTypeRef.current !== eventType) {
      console.log("ALERT FIRED:", stableAlert);

      // Only log fraud alerts
      if (FRAUD_TYPES.has(eventType)) {
        void logFraudEvent({
          sessionId,
          eventType,
        });
      }

      prevAlertTypeRef.current = eventType;
    }
  }, [stableAlert, input.cameraReady]);

  return stableAlert;
}
