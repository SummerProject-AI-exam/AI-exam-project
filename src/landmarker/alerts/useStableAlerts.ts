import { useEffect, useRef, useState } from "react";
import type { AlertType, AlertState } from "./alertTypes";

export function useStableAlert(rawAlert: AlertType | null, delay = 200) {
  const [stableAlert, setStableAlert] = useState<AlertState | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    
    if (timerRef.current) clearTimeout(timerRef.current);

    if (rawAlert === null) {
      setStableAlert(null);
      return;
    }

    timerRef.current = window.setTimeout(() => {
      setStableAlert({
        type: rawAlert,
        timestamp: Date.now(),
      });
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [rawAlert, delay]);

  return stableAlert;
}