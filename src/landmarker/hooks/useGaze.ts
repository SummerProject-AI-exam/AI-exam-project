import { useEffect, useRef, useState } from "react";
import { extractLandmarkFeatures } from "../gaze/extractLandmarkFeatures";
import { computeGazeVector } from "../gaze/computeGazeVector";
import { smoothVector } from "../gaze/smoothVector";

export function useGaze(
  results: any,
  calibStep: "CENTER" | "LEFT" | "RIGHT" | "UP" | "DOWN"
) {
  const [direction, setDirection] = useState("CENTER");
  const [baseline, setBaseline] = useState<{ x: number; y: number } | null>(null);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const [profile, setProfile] = useState<{
    hCenter: number;
    hRange: number;
    vCenter: number;
    vRange: number;
  } | null>(null);

  const [calibProgress, setCalibProgress] = useState<string>("");

  const buffer = useRef<{ x: number; y: number }[]>([]);
  const prev = useRef({ x: 0, y: 0, valid: false });
  const smoothed = useRef({ x: 0, y: 0, valid: false });

  const lastProcessTime = useRef(0);

  const BASE_CALIB_RATE = 1000 / 30;
  const BASE_NORMAL_RATE = 1000 / 15;

  const dynamicRate = useRef(BASE_NORMAL_RATE);

  const centerSamples = useRef<{ x: number; y: number }[]>([]);
  const leftSamples = useRef<{ x: number; y: number }[]>([]);
  const rightSamples = useRef<{ x: number; y: number }[]>([]);
  const upSamples = useRef<{ x: number; y: number }[]>([]);
  const downSamples = useRef<{ x: number; y: number }[]>([]);

  const debug = useRef({
    fps: 0,
    throttle: 0,
    detectionTime: 0,
  });

  // COUNTDOWN
  useEffect(() => {
    if (countdown === null) return;

    if (countdown === 0) {
      centerSamples.current = [];
      leftSamples.current = [];
      rightSamples.current = [];
      upSamples.current = [];
      downSamples.current = [];

      setIsCalibrating(true);
      setCalibProgress("Starting calibration");
      setCountdown(null);
      return;
    }

    const t = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  useEffect(() => {

    if (!results?.faceLandmarks?.length) return;

    const now = performance.now();
    if (now - lastProcessTime.current < dynamicRate.current) return;
    lastProcessTime.current = now;

    const start = performance.now();

    const features = extractLandmarkFeatures(results);
    const raw = computeGazeVector(features);
    if (!raw.valid) return;

    const end = performance.now();
    debug.current.detectionTime = end - start;

    dynamicRate.current = isCalibrating
      ? BASE_CALIB_RATE
      : BASE_NORMAL_RATE;

    smoothVector(prev.current, raw, smoothed.current, 0.25);
    prev.current = { ...smoothed.current };

    buffer.current.push({ x: smoothed.current.x, y: smoothed.current.y });
    if (buffer.current.length > 3) buffer.current.shift();

    const avgX = buffer.current.reduce((a, b) => a + b.x, 0) / buffer.current.length;
    const avgY = buffer.current.reduce((a, b) => a + b.y, 0) / buffer.current.length;

    smoothed.current.x = avgX;
    smoothed.current.y = avgY;

    // --- CALIBRATION ---
    const N = 20;

    if (isCalibrating) {
      let count = 0;

      switch (calibStep) {
        case "CENTER":
          centerSamples.current.push({ x: avgX, y: avgY });
          count = centerSamples.current.length;
          break;
        case "LEFT":
          leftSamples.current.push({ x: avgX, y: avgY });
          count = leftSamples.current.length;
          break;
        case "RIGHT":
          rightSamples.current.push({ x: avgX, y: avgY });
          count = rightSamples.current.length;
          break;
        case "UP":
          upSamples.current.push({ x: avgX, y: avgY });
          count = upSamples.current.length;
          break;
        case "DOWN":
          downSamples.current.push({ x: avgX, y: avgY });
          count = downSamples.current.length;
          break;
      }

      // LOG — progress for current step only
      setCalibProgress(`${calibStep} ${count}/${N}`);

      if (
        centerSamples.current.length >= N &&
        leftSamples.current.length >= N &&
        rightSamples.current.length >= N &&
        upSamples.current.length >= N &&
        downSamples.current.length >= N
      ) {
        const mean = (arr: any[], key: "x" | "y") =>
          arr.reduce((a, b) => a + b[key], 0) / arr.length;

        const meanCenterX = mean(centerSamples.current, "x");
        const meanCenterY = mean(centerSamples.current, "y");

        setBaseline({ x: meanCenterX, y: meanCenterY });
        setIsCalibrating(false);

        const meanLeftX = mean(leftSamples.current, "x");
        const meanRightX = mean(rightSamples.current, "x");
        const meanUpY = mean(upSamples.current, "y");
        const meanDownY = mean(downSamples.current, "y");

        const hCenter = (meanLeftX + meanRightX) / 2;
        const hRange = Math.abs(meanRightX - meanLeftX);

        const vCenter = (meanUpY + meanDownY) / 2;
        const vRange = Math.abs(meanDownY - meanUpY);

        setProfile({ hCenter, hRange, vCenter, vRange });

        // LOG — final completion
        setCalibProgress("Calibration complete");
      }
    }

    // --- DIRECTION ---
    let relX = baseline ? smoothed.current.x - baseline.x * 0.5 : smoothed.current.x;
    let relY = baseline ? smoothed.current.y - baseline.y * 0.5 : smoothed.current.y;

    relY *= 1.8;
    const mirroredX = -relX;

    let newDirection = direction;
    const hysteresis = 0.05;

    if (profile) {
      const { hCenter, hRange, vCenter, vRange } = profile;

      if (mirroredX < hCenter - 0.3 * hRange - hysteresis) newDirection = "LEFT";
      else if (newDirection === "LEFT" && mirroredX > hCenter - 0.3 * hRange + hysteresis) newDirection = "CENTER";

      if (mirroredX > hCenter + 0.3 * hRange + hysteresis) newDirection = "RIGHT";
      else if (newDirection === "RIGHT" && mirroredX < hCenter + 0.3 * hRange - hysteresis) newDirection = "CENTER";

      if (relY < vCenter - 0.3 * vRange - hysteresis) newDirection = "UP";
      else if (newDirection === "UP" && relY > vCenter - 0.3 * vRange + hysteresis) newDirection = "CENTER";

      if (relY > vCenter + 0.3 * vRange + hysteresis) newDirection = "DOWN";
      else if (newDirection === "DOWN" && relY < vCenter + 0.3 * vRange - hysteresis) newDirection = "CENTER";
    }

    setDirection(newDirection);

  }, [results]);

  const startCalibration = () => setCountdown(3);

  return {
    direction,
    isCalibrating,
    baseline,
    countdown,
    startCalibration,
    profile,
    calibProgress,
    debug: debug.current,
  };
}
