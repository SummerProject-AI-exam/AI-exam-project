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
  poseTooLeft: boolean;
  poseTooRight: boolean;
  poseTooDown: boolean;
  poseTooUp: boolean;
}

export function useAlerts(input: AlertInput, sessionId: string): AlertState | null {
  const rawAlert: AlertType | null = useRawAlerts(input);
  const stableAlert = useStableAlert(rawAlert, 300);

  const prevAlertTypeRef = useRef<AlertType | null>(null);
  const readyTimestampRef = useRef<number | null>(null);

  useEffect(() => {
    if (!stableAlert) return;

    const eventType = stableAlert.type;
    const { cameraReady } = input;

    if (cameraReady && !readyTimestampRef.current) {
      readyTimestampRef.current = Date.now();
    }

    if (!cameraReady && eventType !== "CAMERA_NOT_READY") {
      return;
    }

    const now = Date.now();
    if (
      cameraReady &&
      eventType === "CAMERA_OFF" &&
      readyTimestampRef.current &&
      now - readyTimestampRef.current < 500
    ) {
      return;
    }

    if (prevAlertTypeRef.current !== eventType) {
      console.log("ALERT FIRED:", stableAlert);

      void logFraudEvent({
        sessionId,
        eventType
      });

      prevAlertTypeRef.current = eventType;
    }
 }, [stableAlert?.type, input.cameraReady]);


  return stableAlert;
}