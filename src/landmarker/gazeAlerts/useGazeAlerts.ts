import { useEffect, useRef, useState } from "react";
import type { GazeAlertType } from "./alertTypesGaze";

export function useGazeAlerts(direction: string, debug: any): GazeAlertType | null {
  const [alert, setAlert] = useState<GazeAlertType | null>(null);

  const awayCounter = useRef(0);
  const downCounter = useRef(0);
  const switchCounter = useRef(0);
  const freezeCounter = useRef(0);

  const lastDirectionRef = useRef(direction);

  useEffect(() => {
    // Reset when gaze returns to center
    if (direction === "CENTER") {
      awayCounter.current = 0;
      downCounter.current = 0;
      switchCounter.current = 0;
      freezeCounter.current = 0;
      setAlert(null);
      lastDirectionRef.current = direction;
      return;
    }

    // Looking away too long
    if (direction !== "CENTER") {
      awayCounter.current++;
      if (awayCounter.current > 60) {
        setAlert("LOOKING_AWAY");
        return;
      }
    }

    // Looking down too long
    if (direction === "DOWN") {
      downCounter.current++;
      if (downCounter.current > 40) {
        setAlert("LOOKING_DOWN");
        return;
      }
    }

    // Rapid switching
    if (direction !== lastDirectionRef.current) {
      switchCounter.current++;
      lastDirectionRef.current = direction;

      if (switchCounter.current > 20) {
        setAlert("RAPID_GAZE_CHANGES");
        return;
      }
    }

    // Freeze detection
    if (debug?.detectionTime > 80) {
      freezeCounter.current++;
      if (freezeCounter.current > 80) {
        setAlert("NO_MOVEMENT");
        return;
      }
    }

  }, [direction, debug]);

  return alert;
}