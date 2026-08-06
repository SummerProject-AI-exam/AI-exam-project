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
  gazeFrame: {
    valid: boolean;
    fixation: boolean;
    stable: boolean;
    centered: boolean;
    eyesOpen: boolean;
    direction: GazeDirection;
    drift: number;
    confidence: number;
    vectorMagnitude: number;
    eyeOpenness: number;
    x: number;
    y: number;
  },
  dynamicRate: number = 150,
  startExam: boolean
): { alert: GazeAlertType | null; warmupCountdown: number | null } {

const lastDirectionLog = useRef<GazeDirection>("NONE");
const lastStatusLog = useRef(0);

  const alertLeft = useRef(0);
  const alertRight = useRef(0);
  const alertUp = useRef(0);
  const alertDown = useRef(0);
  const alertEyes = useRef(0);

  const [alert, setAlert] = useState<GazeAlertType | null>(null);

  const [warmupDone, setWarmupDone] = useState(false);
  const [warmupCountdown, setWarmupCountdown] = useState<number | null>(null);

  const directionRef = useRef<GazeDirection>("NONE");

  useEffect(() => {
    directionRef.current = gazeFrame.direction;
  }, [gazeFrame.direction]);

  // Warm-up countdown
  useEffect(() => {
    if (!startExam) {
      setWarmupDone(false);
      setWarmupCountdown(null);
      return;
    }

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

    let correctedDirection = direction;

// Vertical axis inversion (MediaPipe Y axis)
if (direction === "UP") correctedDirection = "DOWN";
else if (direction === "DOWN") correctedDirection = "UP";

if (direction !== lastDirectionLog.current) {
  console.log("[DIR]", {
    from: lastDirectionLog.current,
    to: direction,

    x: gazeFrame.x.toFixed(3),
    y: gazeFrame.y.toFixed(3),

    baselineX: baseline.x.toFixed(3),
    baselineY: baseline.y.toFixed(3),

    dx: (gazeFrame.x - baseline.x).toFixed(3),
    dy: (gazeFrame.y - baseline.y).toFixed(3),

    centered: gazeFrame.centered,
    stable: gazeFrame.stable,
    drift: gazeFrame.drift.toFixed(3),
  });

  lastDirectionLog.current = direction;
}
const now = performance.now();

if (now - lastStatusLog.current > 1000) {
  lastStatusLog.current = now;

  if (direction !== "CENTER") {
    console.log("[TRACK]", {
      direction,
      x: gazeFrame.x.toFixed(3),
      y: gazeFrame.y.toFixed(3),
      drift: gazeFrame.drift.toFixed(3),
      centered: gazeFrame.centered,
      stable: gazeFrame.stable,
    });
  }

  console.log("[TIMERS]", {
    L: alertLeft.current,
    R: alertRight.current,
    U: alertUp.current,
    D: alertDown.current,
    Eyes: alertEyes.current,
  });
}

  const {
  x: normX,
  y: normY,
  valid: frameValid,
  confidence,
  eyeOpenness,
  centered,
  stable,
} = gazeFrame;

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

    // EYES COVERED (now using gazeFrame)
    const eyesCovered =
      !frameValid ||
      confidence < 0.5 ||
      eyeOpenness < 0.3;

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
