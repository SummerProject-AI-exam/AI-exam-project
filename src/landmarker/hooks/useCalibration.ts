import { useEffect, useRef, useState, useCallback } from "react";
import { extractLandmarkFeatures } from "../gaze/extractLandmarkFeatures";
import { computeFeatureVector } from "../gaze/computeFeatureVector";
import { useGazeProcessor } from "./useGazeProcessor";
import type { Baseline, RawGaze } from "./useGazeProcessor";

export type CalibrationState =
  | "IDLE"
  | "COUNTDOWN"
  | "WAITING_FOR_FIXATION"
  | "COLLECTING"
  | "COMPLETED"
  | "MONITORING"
  | "ABORTED";

const CALIBRATION_SAMPLES = 20;
const INVALID_TIMEOUT = 2000;

export function useCalibration(results: any) {
  const [baseline, setBaseline] = useState<Baseline | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [calibrationState, setCalibrationState] =
    useState<CalibrationState>("IDLE");

  const baselineBuffer = useRef<{ x: number; y: number }[]>([]);
  const currentCountRef = useRef(0);
  const notLookingTimer = useRef(0);

  const features =
    results?.faceLandmarks?.length
      ? extractLandmarkFeatures(results)
      : null;

  const raw: RawGaze = features
    ? computeFeatureVector(features)
    : { x: 0, y: 0, valid: false };
 const gaze = useGazeProcessor(raw, null);


  const preCalibrationFixation =
  raw.valid &&
  Math.abs(gaze.x) < 0.35 &&
  Math.abs(gaze.y + 0.15) < 0.25;

const fixation = baseline ? gaze.fixation : preCalibrationFixation;
   const abortCalibration = useCallback((_reason: string) => {
    baselineBuffer.current = [];
    currentCountRef.current = 0;
    notLookingTimer.current = 0;

    setBaseline(null);
    setCountdown(null);
    setCalibrationState("ABORTED");
  }, []);

  const completeCalibration = useCallback(() => {
    if (baselineBuffer.current.length === 0) return;

    const meanX =
      baselineBuffer.current.reduce((a, b) => a + b.x, 0) /
      baselineBuffer.current.length;

    const meanY =
      baselineBuffer.current.reduce((a, b) => a + b.y, 0) /
      baselineBuffer.current.length;

    const newBaseline: Baseline = {
      x: Number(meanX.toFixed(3)),
      y: Number(meanY.toFixed(3)),
    };

    setBaseline(newBaseline);
    setCalibrationState("MONITORING");
    notLookingTimer.current = 0;
  }, []);

  const startCalibration = useCallback(() => {
    gaze.reset(); // clear smoothing + stability history

    baselineBuffer.current = [];
    currentCountRef.current = 0;
    notLookingTimer.current = 0;

    setBaseline(null);
    setCountdown(3);
    setCalibrationState("COUNTDOWN");
  }, [gaze]);

  useEffect(() => {
    if (countdown === null) return;

    if (countdown === 0) {
      setCalibrationState("WAITING_FOR_FIXATION");
      setCountdown(null);
      return;
    }

    const t = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  useEffect(() => {
    const state = calibrationState;

    if (
      state !== "WAITING_FOR_FIXATION" &&
      state !== "COLLECTING"
    ) {
      return;
    }

    if (!results?.faceLandmarks?.length) {
      notLookingTimer.current += 100;

      if (notLookingTimer.current > INVALID_TIMEOUT) {
        abortCalibration("No face detected");
      }
      return;
    }
    if (!gaze.valid) {
      notLookingTimer.current += 100;

      if (notLookingTimer.current > INVALID_TIMEOUT) {
        abortCalibration("Invalid gaze");
      }
      return;
    }
   notLookingTimer.current = 0;

    if (state === "WAITING_FOR_FIXATION") {
      if (!fixation) {
        notLookingTimer.current += 100;

        if (notLookingTimer.current > INVALID_TIMEOUT) {
          abortCalibration("Fixation not achieved");
        }
        return;
      }

      setCalibrationState("COLLECTING");
      notLookingTimer.current = 0;
      return;
    }
  if (state === "COLLECTING") {
      if (!gaze.fixation) {
        notLookingTimer.current += 100;

        if (notLookingTimer.current > INVALID_TIMEOUT) {
          abortCalibration("Fixation lost");
        }
        return;
      }

      notLookingTimer.current = 0;

      baselineBuffer.current.push({ x: gaze.x, y: gaze.y });
      currentCountRef.current = baselineBuffer.current.length;

      if (baselineBuffer.current.length >= CALIBRATION_SAMPLES) {
        completeCalibration();
      }
    }
  }, [gaze, calibrationState, results, abortCalibration, completeCalibration]);

  return {
    baseline,
    gaze,
    raw,
    calibrationState,
    countdown,
    startCalibration,

    progress: currentCountRef.current / CALIBRATION_SAMPLES,
    collected: currentCountRef.current,
    total: CALIBRATION_SAMPLES,

    completed: calibrationState === "COMPLETED",
  };
}
