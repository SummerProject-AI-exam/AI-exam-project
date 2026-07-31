import { useEffect, useRef } from "react";
import type { GazeAlertType } from "../gazeAlerts/alertTypesGaze";
import { logFraudEvent } from "../alerts/logFraudEvent";

const eventTypeMap: Record<GazeAlertType, string> = {
  LOOKING_AWAY_LEFT: "GAZE_LOOKING_AWAY_LEFT",
  LOOKING_AWAY_RIGHT: "GAZE_LOOKING_AWAY_RIGHT",
  LOOKING_AWAY_UP: "GAZE_LOOKING_AWAY_UP",
  LOOKING_AWAY_DOWN: "GAZE_LOOKING_AWAY_DOWN",
  EYES_COVERED: "GAZE_EYES_COVERED",
};

export function useAlertsGaze(alert: GazeAlertType | null, sessionId: string) {
  const lastAlertRef = useRef<GazeAlertType | null>(null);

  useEffect(() => {
    if (!alert) return;
    if (!sessionId) return;

    if (alert === lastAlertRef.current) return;

    void logFraudEvent({
      sessionId,
      eventType: eventTypeMap[alert],
    });

    lastAlertRef.current = alert;
  }, [alert, sessionId]);

  return alert;
}
