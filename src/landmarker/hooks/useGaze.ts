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
  const lastStart = useRef(0);
  const lastEnd = useRef(0);

  const centerSamples = useRef<{ x: number; y: number }[]>([]);
  const leftSamples = useRef<{ x: number; y: number }[]>([]);
  const rightSamples = useRef<{ x: number; y: number }[]>([]);
  const upSamples = useRef<{ x: number; y: number }[]>([]);
  const downSamples = useRef<{ x: number; y: number }[]>([]);

  const debug = useRef({
    fps: 0,
    lastTime: performance.now(),
    throttle: 0,
    detectionTime: 0,
  });

  // --------------------------
  // COUNTDOWN LOGIC
  // --------------------------
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

  // --------------------------
  // MAIN PROCESSING LOOP
  // --------------------------
  useEffect(() => {
    if (!results?.faceLandmarks?.length) return;

    const now = performance.now();
    if (now - lastProcessTime.current < dynamicRate.current) return;
    lastProcessTime.current = now;

    lastStart.current = performance.now();

    const features = extractLandmarkFeatures(results);
    const raw = computeGazeVector(features);

    lastEnd.current = performance.now();
    const detectionTime = lastEnd.current - lastStart.current;

    debug.current.detectionTime = detectionTime;
    debug.current.throttle = dynamicRate.current;

    const nowFps = performance.now();
    const delta = nowFps - debug.current.lastTime;
    debug.current.fps = 1000 / delta;
    debug.current.lastTime = nowFps;

    if (isCalibrating) {
      dynamicRate.current = BASE_CALIB_RATE + detectionTime * 0.5;
    } else {
      dynamicRate.current = BASE_NORMAL_RATE + detectionTime * 1.2;
    }

    dynamicRate.current = Math.min(Math.max(dynamicRate.current, 20), 80);

    smoothVector(prev.current, raw, smoothed.current, 0.25);
    prev.current = { ...smoothed.current };

    const dead = 0.0001;
    if (Math.abs(smoothed.current.x) < dead) smoothed.current.x = 0;
    if (Math.abs(smoothed.current.y) < dead) smoothed.current.y = 0;

    buffer.current.push({ x: smoothed.current.x, y: smoothed.current.y });
    if (buffer.current.length > 3) buffer.current.shift();

    const avgX = buffer.current.reduce((a, b) => a + b.x, 0) / buffer.current.length;
    const avgY = buffer.current.reduce((a, b) => a + b.y, 0) / buffer.current.length;

    smoothed.current.x = avgX;
    smoothed.current.y = avgY;

    // --------------------------
    // CALIBRATION SAMPLE COLLECTION
    // --------------------------
    if (isCalibrating) {
      let count = 0;

      switch (calibStep) {
        case "CENTER": centerSamples.current.push({ x: avgX, y: avgY }); count = centerSamples.current.length; break;
        case "LEFT": leftSamples.current.push({ x: avgX, y: avgY }); count = leftSamples.current.length; break;
        case "RIGHT": rightSamples.current.push({ x: avgX, y: avgY }); count = rightSamples.current.length; break;
        case "UP": upSamples.current.push({ x: avgX, y: avgY }); count = upSamples.current.length; break;
        case "DOWN": downSamples.current.push({ x: avgX, y: avgY }); count = downSamples.current.length; break;
      }

      setCalibProgress(`${calibStep} ${count}/5`);

      const N = 40;

      if (
        centerSamples.current.length >= N &&
        leftSamples.current.length >= N &&
        rightSamples.current.length >= N &&
        upSamples.current.length >= N &&
        downSamples.current.length >= N
      ) {
        const mean = (arr: { x: number; y: number }[], key: "x" | "y") =>
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

        setCalibProgress("Calibration complete");
      }
    }

    // --------------------------
    // DIRECTION LOGIC + HYSTERESIS
    // --------------------------
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

  }, [results, isCalibrating, baseline, profile, calibStep]);

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
