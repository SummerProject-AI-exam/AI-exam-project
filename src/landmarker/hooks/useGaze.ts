import { useEffect, useRef, useState } from "react";
import { extractLandmarkFeatures } from "../gaze/extractLandmarkFeatures";
import { smoothVector } from "../gaze/smoothVector";
import { computeFeatureVector } from "../gaze/computeFeatureVector";

type CalibrationState =
  | "IDLE"
  | "COUNTDOWN"
  | "WAITING_FOR_FIXATION"
  | "COLLECTING"
  | "COMPLETED"
  | "ABORTED";

export function useGaze(results: any) {
  const [baseline, setBaseline] = useState<{ x: number; y: number } | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [calibrationState, setCalibrationState] =
    useState<CalibrationState>("IDLE");

  const buffer = useRef<{ x: number; y: number }[]>([]);
  const prev = useRef({ x: 0, y: 0, valid: false });
  const smoothed = useRef({ x: 0, y: 0, valid: false });

  const lastProcessTime = useRef(0);

  const BASE_CALIB_RATE = 1000 / 6;
  const BASE_NORMAL_RATE = 1000 / 5;
  const dynamicRate = useRef(BASE_NORMAL_RATE);

  const baselineBuffer = useRef<{ x: number; y: number }[]>([]);
  const currentCountRef = useRef(0);

  const debug = useRef({
    fps: 0,
    throttle: 0,
    detectionTime: 0,
    studentLooking: false,
  });

  const stabilityBuffer = useRef<{ x: number; y: number }[]>([]);
  const notLookingTimer = useRef(0);

  const variance = (arr: number[]) => {
    if (arr.length === 0) return 0;
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    return arr.reduce((a, b) => a + (b - mean) ** 2, 0) / arr.length;
  };

  const spread = (arr: number[]) => {
    if (arr.length === 0) return Infinity;
    return Math.max(...arr) - Math.min(...arr);
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
      notLookingTimer.current = 0;
      currentCountRef.current = 0;

      setCalibrationState("WAITING_FOR_FIXATION");
      setCountdown(null);
      return;
    }

    const t = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  useEffect(() => {
    const state = calibrationState as CalibrationState;

    // ⭐ NEW: Do NOT abort before calibration actually starts
    if (state !== "WAITING_FOR_FIXATION" && state !== "COLLECTING") {
      return;
    }

    // --- STRICT ABORT: NO FACE DETECTED ---
    if (!results?.faceLandmarks?.length) {
      notLookingTimer.current += dynamicRate.current;
      if (notLookingTimer.current > 2000) {
        console.log("ABORT: no face detected");
        setCalibrationState("ABORTED");
        baselineBuffer.current = [];
        setBaseline(null);
        notLookingTimer.current = 0;
      }
      return;
    }

    const now = performance.now();
    if (now - lastProcessTime.current < dynamicRate.current) return;
    const delta = now - lastProcessTime.current;
    lastProcessTime.current = now;

    debug.current.fps = 1000 / delta;
    debug.current.throttle = dynamicRate.current;

    const start = performance.now();

    const features = extractLandmarkFeatures(results);
    const raw = computeFeatureVector(features);
    if (!raw.valid) {
      notLookingTimer.current += dynamicRate.current;
      if (notLookingTimer.current > 2000) {
        console.log("ABORT: raw gaze invalid");
        setCalibrationState("ABORTED");
        baselineBuffer.current = [];
        setBaseline(null);
        notLookingTimer.current = 0;
      }
      return;
    }

    const end = performance.now();
    debug.current.detectionTime = end - start;

    const isCalibratingPhase =
      state === "WAITING_FOR_FIXATION" || state === "COLLECTING";

    dynamicRate.current = isCalibratingPhase ? BASE_CALIB_RATE : BASE_NORMAL_RATE;

    smoothVector(prev.current, raw, smoothed.current, 0.25);
    prev.current = { ...smoothed.current };

    buffer.current.push({ x: smoothed.current.x, y: smoothed.current.y });
    if (buffer.current.length > 2) buffer.current.shift();

    const avgX =
      buffer.current.reduce((a, b) => a + b.x, 0) / buffer.current.length;
    const avgY =
      buffer.current.reduce((a, b) => a + b.y, 0) / buffer.current.length;

    const normX = Math.max(-1, Math.min(1, avgX));
    const normY = Math.max(-1, Math.min(1, avgY));

    stabilityBuffer.current.push({ x: normX, y: normY });
    if (stabilityBuffer.current.length > 5) {
      stabilityBuffer.current.shift();
    }

    const xs = stabilityBuffer.current.map((p) => p.x);
    const ys = stabilityBuffer.current.map((p) => p.y);

    const varX = variance(xs);
    const varY = variance(ys);

    const spreadX = spread(xs);
    const spreadY = spread(ys);

    const enoughSamples = stabilityBuffer.current.length >= 4;

    const stable =
      enoughSamples &&
      varX < 0.05 &&
      varY < 0.05 &&
      spreadX < 0.6 &&
      spreadY < 0.6;

    debug.current.studentLooking = stable;

    // ⭐ UNIVERSAL FIXATION RULE (works for all humans/webcams)
    const eyeYaw = normX;   // left/right rotation
    const eyePitch = normY; // up/down rotation

   const tooDown = eyePitch < -0.30;   // cheating downward (phone, desk, notes)
const tooUp   = eyePitch > -0.05;   // ceiling / looking up / straight ahead
const tooSide = Math.abs(eyeYaw) > 0.08; // sideways

// Detect drift: cheating downward/upward always drifts
const pitchDrift = spread(ys) > 0.15;

// Universal fixation: stable + correct direction + no drift
const fixation =
  stable &&
  !tooDown &&
  !tooUp &&
  !tooSide &&
  !pitchDrift;


    // --- ABORT: stable but wrong direction ---
    if (stable && (tooDown || tooUp || tooSide)) {
      notLookingTimer.current += dynamicRate.current;
      if (notLookingTimer.current > 2000) {
        console.log("ABORT: stable gaze but wrong direction (not looking forward)");
        setCalibrationState("ABORTED");
        baselineBuffer.current = [];
        setBaseline(null);
        notLookingTimer.current = 0;
        return;
      }
    }

    // --- STRICT ABORT: NEVER FIXATION ---
    if (state === "WAITING_FOR_FIXATION" && !fixation) {
      notLookingTimer.current += dynamicRate.current;
      if (notLookingTimer.current > 2000) {
        console.log("ABORT: never achieved fixation");
        setCalibrationState("ABORTED");
        baselineBuffer.current = [];
        setBaseline(null);
        notLookingTimer.current = 0;
        return;
      }
    }

    if (state === "WAITING_FOR_FIXATION" && fixation) {
      setCalibrationState("COLLECTING");
      notLookingTimer.current = 0;
    }

    // --- STRICT ABORT: FIXATION LOST DURING COLLECTING ---
    if (state === "COLLECTING" && !fixation) {
      notLookingTimer.current += dynamicRate.current;
      if (notLookingTimer.current > 2000) {
        console.log("ABORT: fixation lost during COLLECTING");
        setCalibrationState("ABORTED");
        baselineBuffer.current = [];
        setBaseline(null);
        notLookingTimer.current = 0;
        return;
      }
    }

    if (state === "COLLECTING" && fixation) {
      notLookingTimer.current = 0;
    }

    // --- BASELINE CALIBRATION ---
    const N = 20;

    if (state === "COLLECTING") {
      baselineBuffer.current.push({ x: normX, y: normY });
      currentCountRef.current = baselineBuffer.current.length;

      console.log(
        `SAMPLE ${currentCountRef.current}/${N}: x=${normX.toFixed(
          3
        )}, y=${normY.toFixed(3)}`
      );

      if (baselineBuffer.current.length >= N) {
        const meanX =
          baselineBuffer.current.reduce((a, b) => a + b.x, 0) /
          baselineBuffer.current.length;

        const meanY =
          baselineBuffer.current.reduce((a, b) => a + b.y, 0) /
          baselineBuffer.current.length;

        console.log(
          `COMPLETED baseline: x=${meanX.toFixed(3)}, y=${meanY.toFixed(3)}`
        );

        setBaseline({ x: meanX, y: meanY });
        setCalibrationState("COMPLETED");
        notLookingTimer.current = 0;
      }
    }
  }, [results, calibrationState]);

  const startCalibration = () => {
    console.log("CALIBRATION STARTED");
    setCalibrationState("COUNTDOWN");
    setCountdown(3);
  };

  const calibration = {
    state: calibrationState,
    collected: currentCountRef.current,
    total: 20,
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
    cooperating: debug.current.studentLooking,
  };

  const isCalibrating = calibrationState === "COLLECTING";

  return {
    baseline,
    isCalibrating,
    countdown,
    startCalibration,
    calibration,
    debug: debug.current,
  };
}
