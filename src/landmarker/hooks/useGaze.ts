import { useEffect, useRef, useState } from "react";
import { extractLandmarkFeatures } from "../gaze/extractLandmarkFeatures";
import { smoothVector } from "../gaze/smoothVector";
import { computeFeatureVector } from "../gaze/computeFeatureVector";
import type { GazeVector } from "../gaze/computeGazeVector";
import { computeGazeVector } from "../gaze/computeGazeVector";

type CalibrationState =
  | "IDLE"
  | "COUNTDOWN"
  | "WAITING_FOR_FIXATION"
  | "COLLECTING"
  | "COMPLETED"
  | "MONITORING"
  | "ABORTED";

const CALIBRATION_SAMPLES = 20;
const INVALID_TIMEOUT = 2000;

const BASE_CALIB_RATE = 1000 / 6;
const BASE_NORMAL_RATE = 1000 / 10;

const STABILITY_WINDOW = 5;
const SMOOTH_WINDOW = 1;

const CENTER_X = 0.12;
const CENTER_Y = 0.12;

const MAX_SPREAD = 0.25;
const MAX_VARIANCE = 0.05;


export function useGaze(results: any) {

  const lastDiagLog = useRef(0);
  function diagLog(fn: () => void) {
    const now = performance.now();
    if (now - lastDiagLog.current > 1000) {
      lastDiagLog.current = now;
      fn();
    }
  }
  const [baseline, setBaseline] = useState<{
    x: number;
    y: number;
    centerX: number;
    centerY: number;
    horizontalThreshold: number;
    verticalThreshold: number;
    driftThreshold: number;
    stabilized?: boolean;
  } | null>(null);

  const [countdown, setCountdown] = useState<number | null>(null);
  const [calibrationState, setCalibrationState] =
    useState<CalibrationState>("IDLE");

  const buffer = useRef<{ x: number; y: number }[]>([]);
  const prev = useRef<GazeVector>({
    x: 0,
    y: 0,
    drift: 0,
    stability: 0,
    confidence: 0,
    valid: false,
  });

  const smoothed = useRef<GazeVector>({
    x: 0,
    y: 0,
    drift: 0,
    stability: 0,
    confidence: 0,
    valid: false,
  });

  const lastProcessTime = useRef(0);
  const dynamicRate = useRef(BASE_NORMAL_RATE);

  const baselineBuffer = useRef<{ x: number; y: number }[]>([]);
  const currentCountRef = useRef(0);

  const debug = useRef<{
    fps: number;
    throttle: number;
    detectionTime: number;
    studentLooking: boolean;
    direction: "CENTER" | "LEFT" | "RIGHT" | "UP" | "DOWN" | "NONE";
    drift: number;
    stability: number;
    confidence: number;
    vectorMagnitude: number;
    x: number;
    y: number;
    valid: boolean;
  }>({
    fps: 0,
    throttle: 0,
    detectionTime: 0,
    studentLooking: false,
    direction: "CENTER",
    drift: 0,
    stability: 0,
    confidence: 1,
    vectorMagnitude: 1,
    x: 0,
    y: 0,
    valid: true,
  });

  const [debugState, setDebugState] = useState(debug.current);

  const stabilityBuffer = useRef<{ x: number; y: number }[]>([]);
  const notLookingTimer = useRef(0);

  const lastDirection = useRef<"CENTER" | "LEFT" | "RIGHT" | "UP" | "DOWN" | "NONE">("NONE");
  const lastFixation = useRef(false);
  const lastFrameValid = useRef(true);
  const lastDx = useRef(0);
  const lastDy = useRef(0);

  const dxBuffer = useRef<number[]>([]);
  const dyBuffer = useRef<number[]>([]);

  const alertLeft = useRef(0);
  const alertRight = useRef(0);
  const alertUp = useRef(0);
  const alertDown = useRef(0);
  const alertEyes = useRef(0);

  const alerts = useRef<string[]>([]);

  const variance = (arr: number[]) => {
    if (arr.length === 0) return 0;
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    return arr.reduce((a, b) => a + (b - mean) ** 2, 0) / arr.length;
  };

  const spread = (arr: number[]) => {
    if (arr.length === 0) return Infinity;
    return Math.max(...arr) - Math.min(...arr);
  };

  const abortCalibration = (reason: string) => {
    console.warn(`[ABORT] ${reason}`);

    baselineBuffer.current = [];
    stabilityBuffer.current = [];
    buffer.current = [];

    prev.current = {
      x: 0,
      y: 0,
      drift: 0,
      stability: 0,
      confidence: 0,
      valid: false,
    };

    smoothed.current = {
      x: 0,
      y: 0,
      drift: 0,
      stability: 0,
      confidence: 0,
      valid: false,
    };


    currentCountRef.current = 0;
    notLookingTimer.current = 0;

    lastProcessTime.current = 0;
    dynamicRate.current = BASE_NORMAL_RATE;

    dxBuffer.current = [];
    dyBuffer.current = [];

    setBaseline(null);
    setCalibrationState("ABORTED");
  };

  const completeCalibration = () => {
    const xs = baselineBuffer.current.map(p => p.x);
    const ys = baselineBuffer.current.map(p => p.y);

    const meanX = xs.reduce((a, b) => a + b, 0) / xs.length;
    const meanY = ys.reduce((a, b) => a + b, 0) / ys.length;

    const jitterX = Math.sqrt(variance(xs));
    const jitterY = Math.sqrt(variance(ys));
    const jitter = Math.max(jitterX, jitterY);

    const CENTER_MULT = 2.2;
    const HORIZ_MULT = 2.0;
    const VERT_MULT = 4.0;
    const DRIFT_MULT = 2.0;

    const centerX = jitter * CENTER_MULT;
    const centerY = jitter * CENTER_MULT;

    const horizontalThreshold = jitter * HORIZ_MULT;
    const verticalThreshold = jitter * VERT_MULT;

    const driftThreshold = jitter * DRIFT_MULT;

    console.log("BASELINE:",
      "meanX:", meanX.toFixed(3),
      "meanY:", meanY.toFixed(3),
      "centerX:", centerX.toFixed(3),
      "centerY:", centerY.toFixed(3),
      "horizontalThreshold:", horizontalThreshold.toFixed(3),
      "verticalThreshold:", verticalThreshold.toFixed(3),
      "driftThreshold:", driftThreshold.toFixed(3)
    );

    setBaseline({
      x: meanX,
      y: meanY,
      centerX,
      centerY,
      horizontalThreshold,
      verticalThreshold,
      driftThreshold,
      stabilized: true,
    });

    setCalibrationState("MONITORING");
    notLookingTimer.current = 0;
  };


  useEffect(() => {
    stabilityBuffer.current = [];
    notLookingTimer.current = 0;
  }, []);

  useEffect(() => {
    if (countdown === null) return;

    if (countdown === 0) {
      baselineBuffer.current = [];
      setBaseline(null);

      stabilityBuffer.current = [];
      //notLookingTimer.current = 0;
      currentCountRef.current = 0;

      buffer.current = [];

      prev.current = {
        x: 0,
        y: 0,
        drift: 0,
        stability: 0,
        confidence: 0,
        valid: false,
      };

      smoothed.current = {
        x: 0,
        y: 0,
        drift: 0,
        stability: 0,
        confidence: 0,
        valid: false,
      };

      dxBuffer.current = [];
      dyBuffer.current = [];

      lastProcessTime.current = 0;
      dynamicRate.current = BASE_CALIB_RATE;

      setCalibrationState("WAITING_FOR_FIXATION");
      setCountdown(null);
      return;
    }

    const t = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  useEffect(() => {
    const state = calibrationState as CalibrationState;

    if (
      state !== "WAITING_FOR_FIXATION" &&
      state !== "COLLECTING" &&
      state !== "MONITORING"
    ) {
      return;
    }

    const now = performance.now();
    if (now - lastProcessTime.current < dynamicRate.current) return;
    const delta = now - lastProcessTime.current;
    lastProcessTime.current = now;

    debug.current.fps = 1000 / delta;
    debug.current.throttle = dynamicRate.current;

    const start = performance.now();

    const faceVisible = !!results?.faceLandmarks?.length;

    if (!faceVisible) {
      debug.current.valid = false;
      setDebugState(debug.current);
      return
    }

    const features = extractLandmarkFeatures(results);
    const raw = computeFeatureVector(features);
    const end = performance.now();
    debug.current.detectionTime = end - start;

    const isCalibratingPhase =
      state === "WAITING_FOR_FIXATION" || state === "COLLECTING";

    dynamicRate.current = isCalibratingPhase ? BASE_CALIB_RATE : BASE_NORMAL_RATE;

    const gaze = computeGazeVector(raw, baseline);
    smoothVector(prev.current, gaze, smoothed.current, 0.75);
    prev.current = { ...smoothed.current };

    buffer.current.push({ x: smoothed.current.x, y: smoothed.current.y });
    if (buffer.current.length > SMOOTH_WINDOW) buffer.current.shift();

    const avgX =
      buffer.current.reduce((a, b) => a + b.x, 0) / buffer.current.length;
    const avgY =
      buffer.current.reduce((a, b) => a + b.y, 0) / buffer.current.length;

    const normX = Math.max(-1, Math.min(1, avgX));
    const normY = Math.max(-1, Math.min(1, avgY));

    stabilityBuffer.current.push({ x: normX, y: normY });
    if (stabilityBuffer.current.length > STABILITY_WINDOW) {
      stabilityBuffer.current.shift();
    }

    const xs = stabilityBuffer.current.map((p) => p.x);
    const ys = stabilityBuffer.current.map((p) => p.y);

    const varX = variance(xs);
    const varY = variance(ys);

    const spreadX = spread(xs);
    const spreadY = spread(ys);

    const enoughSamples = stabilityBuffer.current.length >= 4;

    const validVector = raw.valid;

    let stable = false;

    if (!baseline) {
      stable =
        enoughSamples &&
        spreadX < 0.50 &&
        spreadY < 0.50 &&
        varX < 0.20 &&
        varY < 0.20;
    } else {
      const jitter = baseline.centerX;
      stable =
        enoughSamples &&
        spreadX < jitter * 3.0 &&
        spreadY < jitter * 3.0 &&
        varX < jitter * 1.5 &&
        varY < jitter * 1.5;
    }

const dx = smoothed.current.x;
const dy = smoothed.current.y;

    const centeredPreCalibration =
  Math.abs(dx) < CENTER_X &&
  Math.abs(dy) < CENTER_Y;


    let centeredPostCalibration = true;
    if (baseline) {
      centeredPostCalibration =
        Math.abs(normX - baseline.x) < baseline.centerX &&
        Math.abs(normY - baseline.y) < baseline.centerY;
    }

    const centered =
      calibrationState === "MONITORING"
        ? centeredPostCalibration
        : centeredPreCalibration;

    const frameValid =
      faceVisible &&
      validVector;

    const fixation =
      frameValid &&
      centered;

    if (state === "WAITING_FOR_FIXATION") {
      if (!centeredPreCalibration || !frameValid) {
        notLookingTimer.current += dynamicRate.current;
        if (notLookingTimer.current > INVALID_TIMEOUT) {
          abortCalibration("Not looking at the screen");
          return;
        }
        return;
      }
    }

    let direction: "CENTER" | "LEFT" | "RIGHT" | "UP" | "DOWN" | "NONE" = "NONE";

    if (frameValid) {
      const dx = baseline ? normX - baseline.x : normX;
      const dy = baseline ? normY - baseline.y : normY;

      dxBuffer.current.push(dx);
      dyBuffer.current.push(dy);
      if (dxBuffer.current.length > 3) dxBuffer.current.shift();
      if (dyBuffer.current.length > 3) dyBuffer.current.shift();

      const smoothDx =
        dxBuffer.current.reduce((a, b) => a + b, 0) / dxBuffer.current.length;
      const smoothDy =
        dyBuffer.current.reduce((a, b) => a + b, 0) / dyBuffer.current.length;

      const normDx = smoothDx;
      const normDy = smoothDy * 1.4;

      const absDx = Math.abs(normDx);
      const absDy = Math.abs(normDy);

      const centerRatio = baseline ? baseline.centerX : 0.10;

      if (!baseline && Math.abs(normX) < CENTER_X && Math.abs(normY) < CENTER_Y) {
        // pre‑baseline CENTER: raw normX/normY near origin
        direction = "CENTER";
      } else if (absDx < centerRatio && absDy < centerRatio) {
        // post‑baseline CENTER: smoothed dx/dy within jitter‑based center
        direction = "CENTER";
      } else if (absDy > absDx) {
        direction = normDy < 0 ? "UP" : "DOWN";
      } else {
        direction = normDx > 0 ? "LEFT" : "RIGHT";
      }

    }

    if (direction !== lastDirection.current) {
      lastDirection.current = direction;
    }

    let drift = 0;

    if (baseline) {
      const dx = normX - baseline.x;
      const dy = normY - baseline.y;
      drift = Math.sqrt(dx * dx + dy * dy);
    }

    const frame = {
      valid: frameValid,
      fixation,
      stable,
      centered,
      eyesOpen: true,
      direction,
      drift,
      confidence: faceVisible && raw.valid ? 1 : 0.2,
      vectorMagnitude: Math.sqrt(normX * normX + normY * normY),
      eyeOpenness: 1,
      x: normX,
      y: normY,
    };

    setDebugState({
      ...debug.current,
      direction: frame.direction,
      drift: frame.drift,
      stability: frame.stable ? 1 : 0,
      confidence: frame.confidence,
      vectorMagnitude: frame.vectorMagnitude,
      studentLooking: frame.stable,
      x: frame.x,
      y: frame.y,
      valid: frame.valid,
    });

    if (frame.fixation !== lastFixation.current) {
      lastFixation.current = frame.fixation;
    }

    if (state === "WAITING_FOR_FIXATION") {
      if (fixation) {
        setCalibrationState("COLLECTING");
        notLookingTimer.current = 0;
      }
      return;
    }


    if (state === "COLLECTING") {

      if (!fixation) {

        notLookingTimer.current += dynamicRate.current;
      } else {

        notLookingTimer.current -= dynamicRate.current * 2;
      }

      if (notLookingTimer.current < 0) {
        notLookingTimer.current = 0;
      }

      if (notLookingTimer.current > INVALID_TIMEOUT) {
        abortCalibration("Stopped cooperating during sampling");
        return;
      }

      if (fixation && stable) {
        baselineBuffer.current.push({ x: normX, y: normY });
        currentCountRef.current = baselineBuffer.current.length;
      }

      if (baselineBuffer.current.length >= CALIBRATION_SAMPLES) {
        completeCalibration();
      }

      return;
    }

    // Tier‑1 alerts in MONITORING
    if (state === "MONITORING" && baseline) {
      const dt = dynamicRate.current;

      // LEFT
      if (direction === "LEFT") alertLeft.current += dt;
      else alertLeft.current -= dt * 2;

      // RIGHT
      if (direction === "RIGHT") alertRight.current += dt;
      else alertRight.current -= dt * 2;

      // UP
      if (direction === "UP") alertUp.current += dt;
      else alertUp.current -= dt * 2;

      // DOWN (below baseline, not just keyboard)
      const downLooking =
        direction === "DOWN" &&
        normY > baseline.y + baseline.verticalThreshold;

      if (downLooking) alertDown.current += dt;
      else alertDown.current -= dt * 2;

      const eyesCovered =
        !frameValid ||
        frame.eyeOpenness < 0.3 ||
        frame.confidence < 0.5;

      // EYES COVERED / invalid
      if (eyesCovered) alertEyes.current += dt;
      else alertEyes.current -= dt * 2;

      // Clamp
      alertLeft.current = Math.max(0, alertLeft.current);
      alertRight.current = Math.max(0, alertRight.current);
      alertUp.current = Math.max(0, alertUp.current);
      alertDown.current = Math.max(0, alertDown.current);
      alertEyes.current = Math.max(0, alertEyes.current);

      // Thresholds (first version)
      if (alertLeft.current > 1500) alerts.current.push("LOOKING_AWAY_LEFT");
      if (alertRight.current > 1500) alerts.current.push("LOOKING_AWAY_RIGHT");
      if (alertUp.current > 1500) alerts.current.push("LOOKING_AWAY_UP");
      if (alertDown.current > 1500) alerts.current.push("LOOKING_AWAY_DOWN");
      if (alertEyes.current > 800) alerts.current.push("EYES_COVERED");
    }

  }, [results, calibrationState]);

  const startCalibration = () => {
    setCalibrationState("COUNTDOWN");
    setCountdown(3);
  };

  const calibration = {
    state: calibrationState,
    collected: currentCountRef.current,
    total: CALIBRATION_SAMPLES,
    variance:
      stabilityBuffer.current.length > 0
        ? variance(stabilityBuffer.current.map((p) => p.x)) +
        variance(stabilityBuffer.current.map((p) => p.y))
        : 0,
    spread:
      stabilityBuffer.current.length > 0
        ? Math.max(
          spread(stabilityBuffer.current.map((p) => p.x)),
          spread(stabilityBuffer.current.map((p) => p.y))
        )
        : 0,

    cooperating: lastFixation.current,
  };

  const isCalibrating = calibrationState === "COLLECTING";
  const lastState = useRef(calibrationState);

  useEffect(() => {
    if (lastState.current !== calibrationState) {
      console.log("STATE:", calibrationState);
      lastState.current = calibrationState;
    }
  }, [calibrationState]);

  return {
    baseline,
    setBaseline,
    isCalibrating,
    setCalibrationState,
    countdown,
    startCalibration,
    calibration,
    debug: debugState,
    alerts: alerts.current,
  };
}
