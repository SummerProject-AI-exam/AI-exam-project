import { useEffect, useRef, useState } from "react";
import type { GazeAlertType } from "../gazeAlerts/alertTypesGaze";

export function useGazeAlerts(direction: string): GazeAlertType | null {
  const [alert, setAlert] = useState<GazeAlertType | null>(null);

  const lastDirection = useRef(direction);
  const directionStart = useRef<number>(performance.now());

  const COOLDOWN_MS = 5000;
  const lastAlertTime = useRef<number>(0);

  const triggerAlert = (type: GazeAlertType) => {
    const now = performance.now();
    if (now - lastAlertTime.current < COOLDOWN_MS) return;
    lastAlertTime.current = now;
    setAlert(type);
  };

  useEffect(() => {
    const now = performance.now();

    if (direction !== lastDirection.current) {
      lastDirection.current = direction;
      directionStart.current = now;
      setAlert(null);
      return;
    }

    const duration = now - directionStart.current;

    if (direction === "CENTER") {
      setAlert(null);
      return;
    }

    if (direction === "DOWN" && duration > 2000) {
      triggerAlert("LOOKING_DOWN");
      return;
    }

    if ((direction === "LEFT" || direction === "RIGHT") && duration > 3000) {
      triggerAlert("LOOKING_AWAY");
      return;
    }

    if (direction === "UP") {
      return;
    }

  }, [direction]);

  return alert;
}
