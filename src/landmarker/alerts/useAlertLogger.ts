import { useEffect, useRef } from "react";
import { logFraudEvent } from "./logFraudEvent";
import type { AlertState } from "./alertTypes";

export function useAlertLogger(alert: AlertState | null, sessionId: string) {
  const lastLoggedType = useRef<string | null>(null);

  useEffect(() => {
    if (!alert) return;

    const type = alert.type;

    if (type !== lastLoggedType.current) {
      lastLoggedType.current = type;

      void logFraudEvent({
        sessionId,
        eventType: type,
      });
    }
  }, [alert?.type]);
}