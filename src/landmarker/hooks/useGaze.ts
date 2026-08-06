import { useEffect, useRef, useState } from "react";
import { extractGazeFeatures } from "../gaze/extractGazeFeatures";
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

const CENTER_X = 0.08;
const CENTER_Y = 0.08;


const CENTER_ENTER_MULT = 1.0;
const CENTER_EXIT_MULT = 1.35;

export function useGaze(results: any) {

  /* const lastDiagLog = useRef(0);
  function diagLog(fn: () => void) {
    const now = performance.now();
    if (now - lastDiagLog.current > 1000) {
      lastDiagLog.current = now;
      fn();
    }
  } */
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
  const waitingCenterBuffer = useRef<{ x: number; y: number }[]>([]);

  const provisionalCenter = useRef({
    x: 0,
    y: 0,
    centerX: CENTER_X,
    centerY: CENTER_Y,
  });

  const invalidTimer = useRef(0);
  const fixationTimer = useRef(0);

  const lastDirection = useRef<"CENTER" | "LEFT" | "RIGHT" | "UP" | "DOWN" | "NONE">("NONE");
  const lastFixation = useRef(false);

  const dxBuffer = useRef<number[]>([]);
  const dyBuffer = useRef<number[]>([]);

  const gazeFrame = useRef({
  valid: false,
  fixation: false,
  stable: false,
  centered: false,
  eyesOpen: true,
  direction: "NONE" as
    | "CENTER"
    | "LEFT"
    | "RIGHT"
    | "UP"
    | "DOWN"
    | "NONE",
  drift: 0,
  confidence: 0,
  vectorMagnitude: 0,
  eyeOpenness: 1,
  x: 0,
  y: 0,
});

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
    invalidTimer.current = 0;
    fixationTimer.current = 0;

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

// Universal minimums (normalized coordinates)
const MIN_CENTER_X = 0.045;
const MIN_CENTER_Y = 0.050;

const MIN_HORIZONTAL = 0.040;
const MIN_VERTICAL = 0.070;

const MIN_DRIFT = 0.040;

const centerX = Math.max(MIN_CENTER_X, jitter * CENTER_MULT);
const centerY = Math.max(MIN_CENTER_Y, jitter * CENTER_MULT);

const horizontalThreshold = Math.max(
  MIN_HORIZONTAL,
  jitter * HORIZ_MULT
);

const verticalThreshold = Math.max(
  MIN_VERTICAL,
  jitter * VERT_MULT
);

const driftThreshold = Math.max(
  MIN_DRIFT,
  jitter * DRIFT_MULT
);

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
  };


  useEffect(() => {
    stabilityBuffer.current = [];
  }, []);

  useEffect(() => {
    if (countdown === null) return;

    if (countdown === 0) {
      baselineBuffer.current = [];
      setBaseline(null);

      stabilityBuffer.current = [];
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


      invalidTimer.current = 0;
      fixationTimer.current = 0;

      setCalibrationState("WAITING_FOR_FIXATION");
      setCountdown(null);
      return;
    }

    const t = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  useEffect(() => {
    const state = calibrationState as CalibrationState;
    const now = performance.now();
    if (now - lastProcessTime.current < dynamicRate.current) return;
    const delta = now - lastProcessTime.current;
    lastProcessTime.current = now;

    if (
      state !== "WAITING_FOR_FIXATION" &&
      state !== "COLLECTING" &&
      state !== "MONITORING"
    ) {
      return;
    }

    const start = performance.now();

    const faceVisible = !!results?.faceLandmarks?.length;

    if (!faceVisible) {
      if (state !== "MONITORING") {
        invalidTimer.current += dynamicRate.current;

        if (invalidTimer.current > INVALID_TIMEOUT) {
          abortCalibration("No face detected");
          return;
        }
      }

      debug.current.valid = false;
      setDebugState(debug.current);
      return;
    } else {
      invalidTimer.current = 0;
    }

    const features = extractGazeFeatures(results);
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


    let drift = 0;

    if (baseline) {
      const dx = normX - baseline.x;
      const dy = normY - baseline.y;
      drift = Math.sqrt(dx * dx + dy * dy);
    }


    stabilityBuffer.current.push({ x: normX, y: normY });
    if (stabilityBuffer.current.length > STABILITY_WINDOW) {
      stabilityBuffer.current.shift();
    }
    if (state === "WAITING_FOR_FIXATION") {
      waitingCenterBuffer.current.push({ x: normX, y: normY });
      if (waitingCenterBuffer.current.length > 10) {
        waitingCenterBuffer.current.shift();
      }
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
      /* console.log({
        samples: stabilityBuffer.current.length,
        spreadX,
        spreadY,
        varX,
        varY,
      }); */

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

    /* console.log({
      //dx,
      //dy,
      CENTER_X,
      CENTER_Y,
    }); */

    /* console.log({
      smoothedX: smoothed.current.x,
      smoothedY: smoothed.current.y,
      normX,
      normY,
    }); */

    const frameValid =
      faceVisible &&
      validVector;

    let centered = false;

    if (baseline) {
      centered =
        Math.abs(normX - baseline.x) < baseline.centerX &&
        Math.abs(normY - baseline.y) < baseline.centerY;
    } else {
      centered =
        Math.abs(normX - provisionalCenter.current.x) <
        provisionalCenter.current.centerX &&
        Math.abs(normY - provisionalCenter.current.y) <
        provisionalCenter.current.centerY;
    }

    if (state === "WAITING_FOR_FIXATION") {

      const enoughSamples = waitingCenterBuffer.current.length >= 10;

      const xs = waitingCenterBuffer.current.map(p => p.x);
      const ys = waitingCenterBuffer.current.map(p => p.y);

      const meanX_pre = xs.reduce((a, b) => a + b, 0) / xs.length;
      const meanY_pre = ys.reduce((a, b) => a + b, 0) / ys.length;

      const jitterX_pre = Math.sqrt(variance(xs));
      const jitterY_pre = Math.sqrt(variance(ys));
      const jitter_pre = Math.max(jitterX_pre, jitterY_pre);

      const MIN_CENTER = 0.05;
      const CENTER_MULT = 2.2;

      const centerX_pre = Math.max(MIN_CENTER, jitter_pre * CENTER_MULT);
      const centerY_pre = Math.max(MIN_CENTER, jitter_pre * CENTER_MULT);

      provisionalCenter.current = {
        x: meanX_pre,
        y: meanY_pre,
        centerX: centerX_pre,
        centerY: centerY_pre,
      };

      const centeredLocal =
        Math.abs(normX - provisionalCenter.current.x) < provisionalCenter.current.centerX &&
        Math.abs(normY - provisionalCenter.current.y) < provisionalCenter.current.centerY;

      /* console.log({
        //centeredPreCalibration,
        stable,
        meanX_pre,
        meanY_pre,
        centerX_pre,
        centerY_pre,
        jitter_pre,
        fixationTimer: fixationTimer.current,
      }); */

      if (!(centeredLocal && stable)) {
        fixationTimer.current += dynamicRate.current;

        if (fixationTimer.current > INVALID_TIMEOUT) {
          abortCalibration("Not looking at the screen");
          return;
        }

        return;
      }

      fixationTimer.current = 0;
      waitingCenterBuffer.current = [];
      setCalibrationState("COLLECTING");
      return;
    }

    let direction: "CENTER" | "LEFT" | "RIGHT" | "UP" | "DOWN" | "NONE" = "NONE";

    if (frameValid) {

      const referenceX = baseline
    ? baseline.x
    : provisionalCenter.current.x;

const referenceY = baseline
    ? baseline.y
    : provisionalCenter.current.y;

const dx = normX - referenceX;
const dy = normY - referenceY;
      dxBuffer.current.push(dx);
      dyBuffer.current.push(dy);
      if (dxBuffer.current.length > 3) dxBuffer.current.shift();
      if (dyBuffer.current.length > 3) dyBuffer.current.shift();

      const smoothDx =
        dxBuffer.current.reduce((a, b) => a + b, 0) / dxBuffer.current.length;
      const smoothDy =
        dyBuffer.current.reduce((a, b) => a + b, 0) / dyBuffer.current.length;

      const absDx = Math.abs(smoothDx);
      const absDy = Math.abs(smoothDy);

      const centerX = baseline ? baseline.centerX : provisionalCenter.current.centerX;
      const centerY = baseline ? baseline.centerY : provisionalCenter.current.centerY;

const enterCenterX = centerX * CENTER_ENTER_MULT;
const enterCenterY = centerY * CENTER_ENTER_MULT;

const exitCenterX = centerX * CENTER_EXIT_MULT;
const exitCenterY = centerY * CENTER_EXIT_MULT;

const wasCenter = lastDirection.current === "CENTER";

const inCenter = wasCenter
  ? absDx < exitCenterX && absDy < exitCenterY
  : absDx < enterCenterX && absDy < enterCenterY;

if (inCenter) {
  direction = "CENTER";
} else if (absDx > absDy) {
  direction = smoothDx > 0 ? "RIGHT" : "LEFT";
} else {
  direction = smoothDy > 0 ? "DOWN" : "UP";
}
    }

 if (direction !== lastDirection.current) {
  console.log("[GAZE DIR]", {
    from: lastDirection.current,
    to: direction,

    x: normX.toFixed(3),
    y: normY.toFixed(3),

    dx: dxBuffer.current.length
      ? (
          dxBuffer.current.reduce((a, b) => a + b, 0) /
          dxBuffer.current.length
        ).toFixed(3)
      : "0",

    dy: dyBuffer.current.length
      ? (
          dyBuffer.current.reduce((a, b) => a + b, 0) /
          dyBuffer.current.length
        ).toFixed(3)
      : "0",

    centerX: (baseline?.centerX ?? provisionalCenter.current.centerX).toFixed(3),
    centerY: (baseline?.centerY ?? provisionalCenter.current.centerY).toFixed(3),
  });

  lastDirection.current = direction;
}

    const confidence = faceVisible && raw.valid ? 1 : 0.2;
    const eyeOpenness = 1;

    const eyesCovered =
      !frameValid ||
      eyeOpenness < 0.3 ||
      confidence < 0.5;

    /* console.log({
      frameValid,
      centered,
      stable,
      eyesCovered,
      confidence,
      direction,
      baseline: !!baseline,
    }); */

    const fixation =
      frameValid &&
      centered &&
      stable &&
      !eyesCovered &&
      confidence > 0.5 &&
      (
        !baseline ||
        direction === "CENTER"
      );

    /* console.log({
      fixation
    }); */

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

    gazeFrame.current = frame;

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

    if (state === "COLLECTING") {

      if (fixation) {

        baselineBuffer.current.push({
          x: normX,
          y: normY,
        });

        currentCountRef.current = baselineBuffer.current.length;

        fixationTimer.current = 0;

        if (baselineBuffer.current.length >= CALIBRATION_SAMPLES) {
          completeCalibration();
          return;
        }

      } else {

        fixationTimer.current += dynamicRate.current;

        if (fixationTimer.current > INVALID_TIMEOUT) {
          abortCalibration("Fixation lost");
          return;
        }
      }

      return;
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
    gazeFrame: gazeFrame.current,
    dynamicRate: dynamicRate.current,
  };
}