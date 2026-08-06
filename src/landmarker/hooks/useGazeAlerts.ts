import { useEffect, useRef, useState } from "react";
import type { GazeAlertType } from "../gazeAlerts/alertTypesGaze";

type GazeDirection =
  | "CENTER"
  | "LEFT"
  | "RIGHT"
  | "UP"
  | "DOWN"
  | "NONE";

export function useGazeAlerts(
  state: string,
  baseline: {
    x: number;
    y: number;
    centerX: number;
    centerY: number;
    horizontalThreshold: number;
    verticalThreshold: number;
    driftThreshold: number;
  } | null,
  debug: {
    direction: GazeDirection;
    x: number;
    y: number;
    valid: boolean;
    confidence: number;
    eyeOpenness?: number;
  },
  dynamicRate: number = 150,
  startExam: boolean
): { alert: GazeAlertType | null; warmupCountdown: number | null } {

  const alertLeft = useRef(0);
  const alertRight = useRef(0);
  const alertUp = useRef(0);
  const alertDown = useRef(0);
  const alertEyes = useRef(0);

  const [alert, setAlert] = useState<GazeAlertType | null>(null);

  const [warmupDone, setWarmupDone] = useState(false);
  const [warmupCountdown, setWarmupCountdown] = useState<number | null>(null);

  // ⭐ FIX: directionRef MUST be top-level
  const directionRef = useRef<GazeDirection>("NONE");

  // ⭐ FIX: update directionRef at top-level
  useEffect(() => {
    directionRef.current = debug.direction;
  }, [debug.direction]);

  // Warm-up countdown
// Warm-up countdown
useEffect(() => {
  if (!startExam) {
    setWarmupDone(false);
    setWarmupCountdown(null);
    return;
  }

  // Only start warm-up if it hasn't run yet
  if (warmupDone) return;
  if (warmupCountdown !== null) return;

  setWarmupCountdown(3);
}, [startExam, warmupDone]);


  useEffect(() => {
    if (warmupCountdown === null) return;

    if (warmupCountdown === 0) {
      console.log(
        "%c[ALERT ENGINE] Warm-up complete. Starting gaze alerts...",
        "color: #00C853; font-weight: bold;"
      );
      setWarmupDone(true);
      setWarmupCountdown(null);
      return;
    }

    const t = setTimeout(() => setWarmupCountdown(warmupCountdown - 1), 1000);
    return () => clearTimeout(t);
  }, [warmupCountdown]);

  // ⭐ MAIN ALERT ENGINE
  useEffect(() => {
    if (state !== "MONITORING") return;
    if (!baseline) return;
    if (!startExam) return;
    if (!warmupDone) return;

    const dt = dynamicRate;

    const direction = directionRef.current;

    const normX = debug.x;
    const normY = debug.y;
    const frameValid = debug.valid;
    const confidence = debug.confidence;
    const eyeOpenness = debug.eyeOpenness ?? 1;

    // LEFT
    if (direction === "LEFT") alertLeft.current += dt;
    else alertLeft.current -= dt * 2;

    // RIGHT
    if (direction === "RIGHT") alertRight.current += dt;
    else alertRight.current -= dt * 2;

    // UP
    if (direction === "UP") alertUp.current += dt;
    else alertUp.current -= dt * 2;

    // DOWN (only if BELOW baseline)
    const downLooking =
      direction === "DOWN" &&
      normY > baseline.y + baseline.verticalThreshold;

    if (downLooking) alertDown.current += dt;
    else alertDown.current -= dt * 2;

    // EYES COVERED
    const eyesCovered =
      !frameValid ||
      confidence < 0.5 ||
      eyeOpenness < 0.3 ||
      debug.valid === false;

    if (eyesCovered) alertEyes.current += dt;
    else alertEyes.current -= dt * 2;

    // Clamp
    alertLeft.current = Math.max(0, alertLeft.current);
    alertRight.current = Math.max(0, alertRight.current);
    alertUp.current = Math.max(0, alertUp.current);
    alertDown.current = Math.max(0, alertDown.current);
    alertEyes.current = Math.max(0, alertEyes.current);

    // Thresholds
    if (alertLeft.current > 600) setAlert("LOOKING_AWAY_LEFT");
    else if (alertRight.current > 1500) setAlert("LOOKING_AWAY_RIGHT");
    else if (alertUp.current > 1500) setAlert("LOOKING_AWAY_UP");
    else if (alertDown.current > 1500) setAlert("LOOKING_AWAY_DOWN");
    else if (alertEyes.current > 800) setAlert("EYES_COVERED");
    else setAlert(null);

  }, [state, baseline, dynamicRate, startExam, warmupDone]);

  return { alert, warmupCountdown };
}
