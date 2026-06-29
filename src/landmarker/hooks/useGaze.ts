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

  const buffer = useRef<{ x: number; y: number }[]>([]);
  const prev = useRef({ x: 0, y: 0, valid: false });
  const smoothed = useRef({ x: 0, y: 0, valid: false });

  const lastProcessTime = useRef(0);
  const lastLogTime = useRef(0);

 
  const centerSamples = useRef<{ x: number; y: number }[]>([]);
  const leftSamples = useRef<{ x: number; y: number }[]>([]);
  const rightSamples = useRef<{ x: number; y: number }[]>([]);
  const upSamples = useRef<{ x: number; y: number }[]>([]);
  const downSamples = useRef<{ x: number; y: number }[]>([]);

  const logThrottled = (...args: any[]) => {
    const now = performance.now();
    if (now - lastLogTime.current > 400) {
      console.log(...args);
      lastLogTime.current = now;
    }
  };

  useEffect(() => {
    if (countdown === null) return;

    if (countdown === 0) {
      centerSamples.current = [];
      leftSamples.current = [];
      rightSamples.current = [];
      upSamples.current = [];
      downSamples.current = [];

      setIsCalibrating(true);
      setCountdown(null);
      return;
    }

    const t = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  useEffect(() => {
    if (!results?.faceLandmarks?.length) return;

    const now = performance.now();
    const minDelta = 1000 / 15;
    if (now - lastProcessTime.current < minDelta) return;
    lastProcessTime.current = now;

    const features = extractLandmarkFeatures(results);
    const raw = computeGazeVector(features);

  
    smoothVector(prev.current, raw, smoothed.current, 0.10);
    prev.current = { ...smoothed.current };

  
    const dead = 0.0001;
    if (Math.abs(smoothed.current.x) < dead) smoothed.current.x = 0;
    if (Math.abs(smoothed.current.y) < dead) smoothed.current.y = 0;

    buffer.current.push({ x: smoothed.current.x, y: smoothed.current.y });
    if (buffer.current.length > 4) buffer.current.shift();

    const avgX =
      buffer.current.reduce((a, b) => a + b.x, 0) / buffer.current.length;
    const avgY =
      buffer.current.reduce((a, b) => a + b.y, 0) / buffer.current.length;

    smoothed.current.x = avgX;
    smoothed.current.y = avgY;

    if (isCalibrating) {
      if (calibStep === "CENTER") centerSamples.current.push({ x: avgX, y: avgY });
      if (calibStep === "LEFT") leftSamples.current.push({ x: avgX, y: avgY });
      if (calibStep === "RIGHT") rightSamples.current.push({ x: avgX, y: avgY });
      if (calibStep === "UP") upSamples.current.push({ x: avgX, y: avgY });
      if (calibStep === "DOWN") downSamples.current.push({ x: avgX, y: avgY });

      logThrottled("CALIB SAMPLE:", calibStep, avgX, avgY);

      const N = 20;

      if (
        centerSamples.current.length >= N &&
        leftSamples.current.length >= N &&
        rightSamples.current.length >= N &&
        upSamples.current.length >= N &&
        downSamples.current.length >= N
      ) {

        const meanCenterX =
          centerSamples.current.reduce((a, b) => a + b.x, 0) /
          centerSamples.current.length;
        const meanCenterY =
          centerSamples.current.reduce((a, b) => a + b.y, 0) /
          centerSamples.current.length;

        setBaseline({ x: meanCenterX, y: meanCenterY });
        setIsCalibrating(false);

        const mean = (arr: { x: number; y: number }[], key: "x" | "y") =>
          arr.reduce((a, b) => a + b[key], 0) / arr.length;

        const meanLeftX = mean(leftSamples.current, "x");
        const meanRightX = mean(rightSamples.current, "x");
        const meanUpY = mean(upSamples.current, "y");
        const meanDownY = mean(downSamples.current, "y");

        const hCenter = (meanLeftX + meanRightX) / 2;
        const hRange = Math.abs(meanRightX - meanLeftX);

        const vCenter = (meanUpY + meanDownY) / 2;
        const vRange = Math.abs(meanDownY - meanUpY);

        setProfile({ hCenter, hRange, vCenter, vRange });

        console.log("CALIBRATION PROFILE:", {
          hCenter,
          hRange,
          vCenter,
          vRange,
        });
      }
    }

    let relX = baseline ? smoothed.current.x - baseline.x * 0.5 : smoothed.current.x;
    let relY = baseline ? smoothed.current.y - baseline.y * 0.5 : smoothed.current.y;

    relY *= 1.8;

    const mirroredX = -relX;

    let newDirection = "CENTER";

    if (profile) {
      const { hCenter, hRange, vCenter, vRange } = profile;

      // Horizontal
      if (mirroredX < hCenter - 0.3 * hRange) newDirection = "LEFT";
      else if (mirroredX > hCenter + 0.3 * hRange) newDirection = "RIGHT";

      // Vertical
      if (relY < vCenter - 0.3 * vRange) newDirection = "UP";
      else if (relY > vCenter + 0.3 * vRange) newDirection = "DOWN";
    }

    logThrottled("REL:", relX, relY, "DIR:", newDirection);
    setDirection(newDirection);
  }, [results, isCalibrating, baseline, profile]);

  const startCalibration = () => setCountdown(3);

  return {
    direction,
    isCalibrating,
    baseline,
    countdown,
    startCalibration,
    profile,
  };
}
