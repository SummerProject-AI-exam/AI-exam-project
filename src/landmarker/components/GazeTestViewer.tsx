import { useEffect, useRef, useState } from "react";
import { useWebcam } from "../hooks/useWebcam";
import { useFaceLandmarker } from "../hooks/useFaceLandmarker";
import { useGaze } from "../hooks/useGaze";

export function GazeTestViewer() {
  const { videoRef, startCamera, stopCamera } = useWebcam();

  const [calibStep, setCalibStep] = useState<
    "CENTER" | "LEFT" | "RIGHT" | "UP" | "DOWN"
  >("CENTER");

  const { isLoaded, results, canvasRef } = useFaceLandmarker(videoRef, {
    disableDrawing: true,
  });

  const { direction, isCalibrating, baseline, countdown, startCalibration } =
    useGaze(results, calibStep);

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

    let dx = 0, dy = 0;

    if (direction === "LEFT") dx = -len;
    if (direction === "RIGHT") dx = len;
    if (direction === "UP") dy = -len;
    if (direction === "DOWN") dy = len;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + dx, cy + dy);
    ctx.strokeStyle = isCalibrating ? "orange" : "red";
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

    const steps = [
      { step: "CENTER", delay: 1000 },
      { step: "LEFT", delay: 2500 },
      { step: "RIGHT", delay: 4000 },
      { step: "UP", delay: 5500 },
      { step: "DOWN", delay: 7000 },
    ];

    steps.forEach(({ step, delay }) => {
      setTimeout(() => {
        setCalibStep(step as any);
      }, delay);
    });
  }, [isCalibrating, countdown]);

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
        top: box.height * 0.50,
        left: box.width * 0.50,
      },
      LEFT: {
        top: box.height * 0.50,
        left: box.width * 0.02,
      },
      RIGHT: {
        top: box.height * 0.50,
        left: box.width * 0.98,
      },
      UP: {
        top: box.height * 0.02,
        left: box.width * 0.50,
      },
      DOWN: {
        top: box.height * 0.98,
        left: box.width * 0.50,
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
            zIndex: 10,
          }}
        >
          Loading model…
        </div>
      )}


      <div
        ref={videoContainerRef}
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
        }}
      >
        <video
          ref={videoRef}
          style={{ width: "100%", height: "100%", transform: "scaleX(-1)" }}
          playsInline
          muted
        />

        <canvas ref={canvasRef} style={{ display: "none" }} />

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
              zIndex: 999999,
              pointerEvents: "none",
            }}
          >
            {countdown !== null && (
              <div
                style={{
                  position: "absolute",
                  top: -30,
                  left: "50%",
                  transform: "translateX(-50%)",
                  color: "white",
                  fontSize: "0.9rem",
                }}
              >
                {countdown}
              </div>
            )}
          </div>
        )}
      </div>

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
        }}
      >
        Gaze: {direction}
        {isCalibrating && " (calibrating)"}
        {baseline && !isCalibrating && " (calibrated)"}
      </div>

      <button
        onClick={startCalibration}
        style={{
          position: "absolute",
          bottom: "10px",
          right: "10px",
          zIndex: 20,
        }}
      >
        Calibrate
      </button>
    </div>
  );
}
