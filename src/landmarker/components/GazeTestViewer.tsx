import { useEffect, useRef, useState } from "react";
import { useWebcam } from "../hooks/useWebcam";
import { useGaze } from "../hooks/useGaze";
import { useGazeAlerts } from "../gazeAlerts/useGazeAlerts";
import { useStableAlert } from "../alerts/useStableAlerts";
import { useStableGazeAlert } from "../hooks/useStableGazeAlert";
import { useFaceLandmarker } from "../hooks/useFaceLandmarker";

export function GazeTestViewer() {
  const { videoRef, startCamera, stopCamera } = useWebcam();

  const [calibStep, setCalibStep] = useState<
    "CENTER" | "LEFT" | "RIGHT" | "UP" | "DOWN"
  >("CENTER");

  const { isLoaded, results } = useFaceLandmarker(videoRef);

  const {
    direction,
    isCalibrating,
    baseline,
    countdown,
    startCalibration,
    calibProgress,
    debug,
  } = useGaze(results, calibStep);

  const rawGazeAlert = useGazeAlerts(direction, debug);
  const stableGazeAlert = useStableGazeAlert(rawGazeAlert, 300);


  const stepSamplesRef = useRef({
    CENTER: 0,
    LEFT: 0,
    RIGHT: 0,
    UP: 0,
    DOWN: 0,
  });

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const arrowCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!arrowCanvasRef.current) return;

    const canvas = arrowCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const len = 80;

    let dx = 0,
      dy = 0;

    if (direction === "LEFT") dx = -len;
    if (direction === "RIGHT") dx = len;
    if (direction === "UP") dy = -len;
    if (direction === "DOWN") dy = len;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + dx, cy + dy);
    if (isCalibrating) return;
    ctx.lineWidth = 4;
    ctx.stroke();
  }, [direction, isCalibrating]);

  const timelineStarted = useRef(false);

  useEffect(() => {
    if (!isCalibrating) {
      timelineStarted.current = false;
      return;
    }

    if (countdown !== null) return;
    if (timelineStarted.current) return;

    timelineStarted.current = true;

    const DOT_DURATION = 2000;

    setTimeout(() => {
      const steps: Array<{
        step: "CENTER" | "LEFT" | "RIGHT" | "UP" | "DOWN";
        delay: number;
      }> = [
          { step: "CENTER", delay: DOT_DURATION * 0 },
          { step: "LEFT", delay: DOT_DURATION * 1 },
          { step: "RIGHT", delay: DOT_DURATION * 2 },
          { step: "UP", delay: DOT_DURATION * 3 },
          { step: "DOWN", delay: DOT_DURATION * 4 },
        ];

      steps.forEach(({ step, delay }) => {
        setTimeout(() => {

          const prevStep = calibStep;
          const prevCount = stepSamplesRef.current[prevStep];

          if (prevCount < 5 && prevStep !== "CENTER") {
            console.warn(`[CALIB] Not enough samples for ${prevStep}, retrying`);
            return;
          }

          setCalibStep(step);
          stepSamplesRef.current[step] = 0;

        }, delay);
      });

    }, 500);
  }, [isCalibrating, countdown]);

  useEffect(() => {
    if (!isCalibrating) return;

    const step = calibStep;
    stepSamplesRef.current[step]++;

    const count = stepSamplesRef.current[step];

    if (count % 10 === 0) {
      console.log(`[CALIB SAMPLE] step=${step} | samples=${count}`);
    }
  }, [calibProgress, calibStep, isCalibrating]);

  useEffect(() => {
    if (!isCalibrating && baseline) {
      console.log("[CALIB SUMMARY]");
      console.log(JSON.stringify(stepSamplesRef.current, null, 2));
    }
  }, [isCalibrating, baseline]);

  const videoContainerRef = useRef<HTMLDivElement>(null);

  const [dynamicPositions, setDynamicPositions] = useState({
    CENTER: { top: 0, left: 0 },
    LEFT: { top: 0, left: 0 },
    RIGHT: { top: 0, left: 0 },
    UP: { top: 0, left: 0 },
    DOWN: { top: 0, left: 0 },
  });

  useEffect(() => {
    const updateDotPositions = () => {
      const box = videoContainerRef.current?.getBoundingClientRect();
      if (!box) return;

      setDynamicPositions({
        CENTER: {
          top: box.height * 0.5,
          left: box.width * 0.5,
        },
        LEFT: {
          top: box.height * 0.5,
          left: box.width * 0.02,
        },
        RIGHT: {
          top: box.height * 0.5,
          left: box.width * 0.98,
        },
        UP: {
          top: box.height * 0.02,
          left: box.width * 0.5,
        },
        DOWN: {
          top: box.height * 0.98,
          left: box.width * 0.5,
        },
      });
    };

    updateDotPositions();
    window.addEventListener("resize", updateDotPositions);
    return () => window.removeEventListener("resize", updateDotPositions);
  }, []);

return (
  <div
    style={{
      position: "relative",
      width: "100%",
      maxWidth: "1200px",
      height: "80vh",
      margin: "0 auto",
    }}
  >
    {!isLoaded && (
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.2rem",
          zIndex: 10000,
        }}
      >
        Loading model…
      </div>
    )}

    {/* VIDEO AREA */}
    <div
      ref={videoContainerRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 1,
        isolation: "isolate",
      }}
    >
      <video
        ref={videoRef}
        style={{ width: "100%", height: "100%", transform: "scaleX(-1)" }}
        playsInline
        muted
      />

      <canvas
        ref={arrowCanvasRef}
        width={640}
        height={480}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          transform: "scaleX(-1)",
        }}
      />

      {isCalibrating && (
        <>
          <div
            style={{
              position: "absolute",
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: "red",
              transform: "translate(-50%, -50%)",
              top: dynamicPositions[calibStep].top,
              left: dynamicPositions[calibStep].left,
              zIndex: 2,
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              position: "absolute",
              top: dynamicPositions[calibStep].top + 40,
              left: dynamicPositions[calibStep].left,
              transform: "translate(-50%, -50%)",
              color: "white",
              fontSize: "16px",
              fontWeight: "bold",
              zIndex: 2,
              pointerEvents: "none",
              textShadow: "0 0 4px black",
            }}
          >
            {calibProgress}
          </div>

          {countdown !== null && (
            <div
              style={{
                position: "absolute",
                top: dynamicPositions[calibStep].top - 40,
                left: dynamicPositions[calibStep].left,
                transform: "translate(-50%, -50%)",
                color: "white",
                fontSize: "0.9rem",
                zIndex: 2,
              }}
            >
              {countdown}
            </div>
          )}
        </>
      )}
    </div>

    {/* DEBUG BOXES ABOVE VIDEO */}
    <div
      style={{
        position: "absolute",
        bottom: "10px",
        left: "10px",
        background: "rgba(0,0,0,0.6)",
        color: "white",
        padding: "4px 8px",
        borderRadius: "4px",
        fontSize: "0.8rem",
        zIndex: 9999, 
      }}
    >
      Gaze: {direction}
      {isCalibrating && " (calibrating)"}
      {baseline && !isCalibrating && " (calibrated)"}
    </div>

    <div
      style={{
        position: "absolute",
        bottom: "10px",
        left: "150px",
        background: "rgba(0,0,0,0.6)",
        color: "white",
        padding: "6px 10px",
        borderRadius: "4px",
        fontSize: "0.75rem",
        lineHeight: "1.2rem",
        zIndex: 9999,
      }}
    >
      <div>FPS: {debug.fps.toFixed(1)}</div>
      <div>Throttle: {debug.throttle.toFixed(1)} ms</div>
      <div>Detect: {debug.detectionTime.toFixed(2)} ms</div>
    </div>

    <div
      style={{
        position: "absolute",
        bottom: "10px",
        left: "300px",
        background: "rgba(0,0,0,0.6)",
        color: "white",
        padding: "6px 10px",
        borderRadius: "4px",
        fontSize: "0.75rem",
        lineHeight: "1.2rem",
        zIndex: 9999, 
      }}
    >
      <div>Raw gaze alert: {rawGazeAlert ?? "none"}</div>
      <div>Stable gaze alert: {stableGazeAlert?.type ?? "none"}</div>
    </div>

    <button
      onClick={startCalibration}
      style={{
        position: "absolute",
        bottom: "10px",
        right: "10px",
        zIndex: 9999, 
      }}
    >
      Calibrate
    </button>
  </div>
);
}
