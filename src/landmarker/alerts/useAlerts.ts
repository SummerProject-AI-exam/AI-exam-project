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

export function useAlerts(input: AlertInput, sessionId: string): AlertState | null {
  const rawAlert: AlertType | null = useRawAlerts(input);
  const stableAlert = useStableAlert(rawAlert, 300);

// Debug: log raw and stable alerts only when they change
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
  const hasFiredReadyRef = useRef(false);

  useEffect(() => {
    const { cameraReady, cameraBlocked, cameraOff } = input;

    if (cameraReady && !cameraBlocked && !hasFiredReadyRef.current) {
      hasFiredReadyRef.current = true;

      console.log("ALERT FIRED: CAMERA_READY");
      void logFraudEvent({
        sessionId,
        eventType: "CAMERA_READY",
      });

      prevAlertTypeRef.current = "CAMERA_READY";
      return;
    }

    if (!hasFiredReadyRef.current) {
      return;
    }

    if (!stableAlert) {

  prevAlertTypeRef.current = null;
  return;
}

    const eventType = stableAlert.type;

    if (eventType === "CAMERA_BLOCKED") {
      if (prevAlertTypeRef.current !== "CAMERA_BLOCKED") {
        console.log("ALERT FIRED: CAMERA_BLOCKED");
        void logFraudEvent({
          sessionId,
          eventType: "CAMERA_BLOCKED",
        });
        prevAlertTypeRef.current = "CAMERA_BLOCKED";
      }
      return;
    }

if (prevAlertTypeRef.current !== eventType) {
  console.log("ALERT FIRED:", stableAlert);

  if (eventType !== "OK") {
    void logFraudEvent({
      sessionId,
      eventType,
    });
  }

  prevAlertTypeRef.current = eventType;
}

  }, [
    stableAlert,
    input.cameraReady,
    input.cameraBlocked,
    input.cameraOff,
  ]);

  return stableAlert;
}
