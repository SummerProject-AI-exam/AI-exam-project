import { useEffect, useRef, useState } from "react";
import { useWebcam } from "../hooks/useWebcam";
import { useGaze } from "../hooks/useGaze";
import { useGazeAlerts } from "../gazeAlerts/useGazeAlerts";
import { useStableGazeAlert } from "../hooks/useStableGazeAlerts";
import { useFaceLandmarker } from "../hooks/useFaceLandmarker";

export function GazeTestViewer() {
  const { videoRef, startCamera, stopCamera } = useWebcam();

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const videoRefStable = videoRef as React.RefObject<HTMLVideoElement>;

  const { canvasRef, results } = useFaceLandmarker(videoRefStable, {
    fps: 10,
    maxDurationMs: undefined,
  });

  const {
    baseline,
    isCalibrating,
    countdown,
    startCalibration,
    calibration,
    debug,
  } = useGaze(results);

  const state = calibration.state;
  const collected = calibration.collected;
  const total = calibration.total;

  const lastProgressRef = useRef(-1);

  useEffect(() => {
    if (state === "COMPLETED" || state === "ABORTED") return;
    if (!isCalibrating) return;

    if (lastProgressRef.current !== collected) {
      console.log("PROGRESS →", `${collected}/${total}`);
      lastProgressRef.current = collected;
    }
  }, [state, isCalibrating, collected, total]);

  const rawGazeAlert = useGazeAlerts("", debug);
  const stableGazeAlert = useStableGazeAlert(rawGazeAlert, 300);

  const arrowCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!arrowCanvasRef.current) return;
    const ctx = arrowCanvasRef.current.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, arrowCanvasRef.current.width, arrowCanvasRef.current.height);
  }, [state, isCalibrating]);

  const videoContainerRef = useRef<HTMLDivElement>(null);

  const [dynamicPositions, setDynamicPositions] = useState({
    CENTER: { top: 0, left: 0 },
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
      });
    };

    updateDotPositions();
    window.addEventListener("resize", updateDotPositions);
    return () => window.removeEventListener("resize", updateDotPositions);
  }, []);

  // ⭐ If calibration is complete, show the completion message
  if (state === "COMPLETED" && baseline) {
    return (
      <div
        style={{
          color: "white",
          padding: 20,
          fontSize: "1.4rem",
          textAlign: "center",
        }}
      >
        Calibration complete!
      </div>
    );
  }

  // ⭐ Otherwise render the main viewer
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
      {!results && (
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
          autoPlay
          playsInline
          muted
        />

        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* SIMPLE CENTER DOT FOR BASELINE CALIBRATION */}
        {(state === "WAITING_FOR_FIXATION" || state === "COLLECTING") && (
          <>
            <div
              style={{
                position: "absolute",
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: "red",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 2,
                pointerEvents: "none",
              }}
            />

            <div
              style={{
                position: "absolute",
                top: "calc(50% + 40px)",
                left: "50%",
                transform: "translate(-50%, -50%)",
                color: "white",
                fontSize: "16px",
                fontWeight: "bold",
                zIndex: 2,
                pointerEvents: "none",
                textShadow: "0 0 4px black",
              }}
            >
              {calibration.collected}/{calibration.total}
            </div>

            {countdown !== null && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(50% - 40px)",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  color: "white",
                  fontSize: "2rem",
                  zIndex: 2,
                }}
              >
                {countdown}
              </div>
            )}
          </>
        )}
      </div>

      {/* DEBUG BOXES */}
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
        {isCalibrating && "Calibrating…"}
        {baseline && !isCalibrating && "Calibrated"}
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

      {countdown !== null && (
        <div
          style={{
            position: "absolute",
            bottom: "60px",
            right: "10px",
            color: "white",
            fontSize: "2rem",
            zIndex: 9999,
          }}
        >
          {countdown}
        </div>
      )}
    </div>
  );
}
