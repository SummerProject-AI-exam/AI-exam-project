import { useEffect, useRef, useState } from "react";
import type { AlertType } from "./alertTypes";

export function useStableAlert(rawAlert: AlertType | null, delay = 300) {
  const [stableAlert, setStableAlert] = useState<AlertType | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // If the alert is the same, do nothing
    if (rawAlert === stableAlert) return;

    // Clear previous timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // If rawAlert is null, clear immediately
    if (rawAlert === null) {
      setStableAlert(null);
      return;
    }

    // Otherwise wait delay ms before confirming the alert
    timerRef.current = window.setTimeout(() => {
      setStableAlert(rawAlert);
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [rawAlert, stableAlert, delay]);

  return stableAlert;
}
