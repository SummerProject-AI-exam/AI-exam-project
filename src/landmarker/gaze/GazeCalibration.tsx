import { useEffect, useRef, useState } from "react";
import { useWebcam } from "../hooks/useWebcam";
import { useFaceLandmarker } from "../hooks/useFaceLandmarker";
import { extractLandmarkFeatures } from "./extractLandmarkFeatures";
import { computeGazeVector } from "./computeGazeVector";

console.log("GAZE CALIBRATION MOUNTED");

export type CalibrationStep =
  | "CENTER"
  | "LEFT"
  | "RIGHT"
  | "UP"
  | "DOWN"
  | "DONE";

const sequence: CalibrationStep[] = [
  "CENTER",
  "LEFT",
  "RIGHT",
  "UP",
  "DOWN",
  "DONE",
];

export function GazeCalibration({ onDone }: { onDone: (model: any) => void }) {
  const { videoRef, startCamera, stopCamera } = useWebcam();

  const { results } = useFaceLandmarker(videoRef, { disableDrawing: true });

  const [calibrating, setCalibrating] = useState(false);

  const [stepIndex, setStepIndex] = useState(0);
  const step = sequence[stepIndex];

  const [countdown, setCountdown] = useState<number | null>(null);
  const [sampling, setSampling] = useState(false);

  const samples = useRef<{ x: number; y: number }[]>([]);

  const calibrationData = useRef<Record<
    Exclude<CalibrationStep, "DONE">,
    { x: number; y: number } | null
  >>({
    CENTER: null,
    LEFT: null,
    RIGHT: null,
    UP: null,
    DOWN: null,
  });


  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  function startCalibration() {
    console.log("START CALIBRATION");
    setCalibrating(true);
    setStepIndex(0);
    samples.current = [];
    setCountdown(3);
  }

  useEffect(() => {
    console.log("COUNTDOWN EFFECT", { calibrating, countdown });
    if (!calibrating) return;
    if (countdown === null) return;

    if (countdown === 0) {
      console.log("COUNTDOWN DONE → START SAMPLING");
      setSampling(true);
      setCountdown(null);
      return;
    }

    const t = setTimeout(() => setCountdown((c) => (c !== null ? c - 1 : null)), 1000);
    return () => clearTimeout(t);
  }, [countdown, calibrating]);

  function storeCalibrationSample(step: CalibrationStep, avgX: number, avgY: number) {
    if (step === "DONE") return;
    calibrationData.current[step] = { x: avgX, y: avgY };
  }

  function validateStep(step: CalibrationStep, samples: { x: number; y: number }[]) {
    if (step === "DONE") return;

    if (samples.length < 5) {
      console.warn("Not enough samples, retrying step");
      return restartStep();
    }

    const avgX = samples.reduce((a, b) => a + b.x, 0) / samples.length;
    const avgY = samples.reduce((a, b) => a + b.y, 0) / samples.length;

    console.log("STEP AVERAGE", step, {
      avgX,
      avgY,
      count: samples.length,
    });

    calibrationData.current[step] = { x: avgX, y: avgY };

    goToNextStep();
  }

  function restartStep() {
    samples.current = [];
    setCountdown(3);
  }

  function goToNextStep() {
    samples.current = [];
    setStepIndex((i) => i + 1);
    setCountdown(3);
  }

  useEffect(() => {
    if (!calibrating) return;
    if (!sampling) return;
    if (!results?.faceLandmarks?.length) return;

    const id = setInterval(() => {
      const features = extractLandmarkFeatures(results);
      const raw = computeGazeVector(features);
      samples.current.push({ x: raw.x, y: raw.y });
    }, 50);

    const stop = setTimeout(() => {
      clearInterval(id);
      setSampling(false);

      if (step === "DONE") {
        const model = computeCalibrationModel();
        onDone(model);
        setCalibrating(false);
        return;
      }

      validateStep(step, samples.current);
      samples.current = [];
    }, 1000);

    return () => {
      clearInterval(id);
      clearTimeout(stop);
    };
  }, [sampling, results, step, calibrating]);

  function computeCalibrationModel() {
    const data = calibrationData.current;

    if (!data.CENTER || !data.LEFT || !data.RIGHT || !data.UP || !data.DOWN) {
      console.error("Calibration incomplete");
      return null;
    }

    const xSign = data.LEFT.x < data.RIGHT.x ? 1 : -1;
    const ySign = data.UP.y < data.DOWN.y ? 1 : -1;

    const xRange = Math.abs(data.RIGHT.x - data.LEFT.x);
    const yRange = Math.abs(data.DOWN.y - data.UP.y);

    const centerX = data.CENTER.x;
    const centerY = data.CENTER.y;

    const noise = {
      x: Math.min(
        Math.abs(data.CENTER.x - data.LEFT.x),
        Math.abs(data.CENTER.x - data.RIGHT.x)
      ) * 0.1,
      y: Math.min(
        Math.abs(data.CENTER.y - data.UP.y),
        Math.abs(data.CENTER.y - data.DOWN.y)
      ) * 0.1,
    };

    return {
      xSign,
      ySign,
      xRange,
      yRange,
      centerX,
      centerY,
      noise,
    };
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <video
        ref={videoRef}
        style={{
          width: "100%",
          transform: "scaleX(-1)",
          zIndex: 1,
          position: "relative"
        }}
      />


      {!calibrating && (
        <button
          onClick={startCalibration}
          style={{
            position: "absolute",
            bottom: 20,
            right: 20,
            padding: "10px 20px",
            fontSize: 18,
          }}
        >
          Calibrate
        </button>
      )}

      {calibrating && (
        <CalibrationTarget step={step} countdown={countdown} />
      )}
    </div>
  );
}

function CalibrationTarget({
  step,
  countdown,
}: {
  step: CalibrationStep;
  countdown: number | null;
}) {
  const style: React.CSSProperties = {
    position: "absolute",
    width: 20,
    height: 20,
    borderRadius: "50%",
    background: "red",
    zIndex: 9999,
  };

  const positions: Record<CalibrationStep, React.CSSProperties> = {
    CENTER: { top: "50%", left: "50%", transform: "translate(-50%, -50%)" },
    LEFT: { top: "50%", left: "10%" },
    RIGHT: { top: "50%", left: "90%" },
    UP: { top: "10%", left: "50%" },
    DOWN: { top: "90%", left: "50%" },
    DONE: { top: "50%", left: "50%", transform: "translate(-50%, -50%)" },
  };

  return (
    <div style={{ ...style, ...positions[step] }}>
      {countdown !== null && (
        <div style={{ position: "absolute", top: -30, color: "white" }}>
          {countdown}
        </div>
      )}
    </div>
  );
}
