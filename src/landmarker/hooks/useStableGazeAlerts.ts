import { useEffect, useRef, useState } from "react";
import type { GazeAlertType } from "../gazeAlerts/alertTypesGaze";

export function useStableGazeAlert(
  raw: GazeAlertType | null,
  delay: number
): { type: GazeAlertType } | null {
  const [stable, setStable] = useState<{ type: GazeAlertType } | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!raw) {
      setStable(null);
      return;
    }

    timerRef.current = setTimeout(() => {
      setStable({ type: raw });
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [raw, delay]);

  return stable;
}