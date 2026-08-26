import { useEffect, useRef, useState } from "react";
import { useWebcam } from "../hooks/useWebcam";
import { useFaceLandmarker } from "../hooks/useFaceLandmarker";
import { useGaze } from "../hooks/useGaze";
import { logFraudEvent } from "../alerts/logFraudEvent";

export function CalibrationViewer({ sessionId }: { sessionId: string }) {
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

  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [dotPos, setDotPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const updateDot = () => {
      const box = videoContainerRef.current?.getBoundingClientRect();
      if (!box) return;

      setDotPos({
        top: box.height * 0.5,
        left: box.width * 0.5,
      });
    };

    updateDot();
    window.addEventListener("resize", updateDot);
    return () => window.removeEventListener("resize", updateDot);
  }, []);

  const [sampleLog, setSampleLog] = useState<string>("");

  useEffect(() => {
    if (!isCalibrating) return;

    const c = calibration.collected;
    if (c === 0) return;

    const log = `
Sample ${c}/${calibration.total}
x=${debug.x.toFixed(3)} y=${debug.y.toFixed(3)}
stable=${debug.stability}
fixation=${debug.valid && debug.direction === "CENTER"}
variance=${calibration.variance.toFixed(4)}
spread=${calibration.spread.toFixed(4)}
drift=${debug.drift.toFixed(3)}
direction=${debug.direction}
valid=${debug.valid}
confidence=${debug.confidence.toFixed(2)}
vector=${debug.vectorMagnitude.toFixed(3)}
`;

    setSampleLog(log);
    console.log(log);
  }, [calibration.collected]);

  useEffect(() => {
    if (calibration.state === "MONITORING" && baseline) {
      logFraudEvent({
        sessionId,
        eventType: "CALIBRATION_READY",
      });
    }
  }, [calibration.state, baseline]);

  useEffect(() => {
  if (calibration.state === "MONITORING" && baseline) {
    localStorage.setItem("gazeBaseline", JSON.stringify(baseline));
  }
}, [calibration.state, baseline]);


  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "1200px",
        height: "60vh",
        margin: "0 auto",
      }}
    >
      {/* LOADING */}
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

      {/* VIDEO + FACE LANDMARKER */}
      <div
        ref={videoContainerRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 1,
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
            transform: "scaleX(-1)",
            zIndex: 0,
          }}
        />

        {/* DOT + COUNTDOWN + SAMPLE COUNT */}
        {(isCalibrating || countdown !== null) &&
          calibration.state !== "ABORTED" && (
            <>
              {/* DOT */}
              <div
                style={{
                  position: "absolute",
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background: "red",
                  transform: "translate(-50%, -50%)",
                  top: dotPos.top,
                  left: dotPos.left,
                  zIndex: 2,
                  pointerEvents: "none",
                }}
              />

              {/* COUNTDOWN */}
              {countdown !== null && (
                <div
                  style={{
                    position: "absolute",
                    top: dotPos.top - 40,
                    left: dotPos.left,
                    transform: "translate(-50%, -50%)",
                    color: "white",
                    fontSize: "2rem",
                    fontWeight: "bold",
                    zIndex: 2,
                    textShadow: "0 0 6px black",
                  }}
                >
                  {countdown}
                </div>
              )}

              {/* SAMPLE COUNT */}
              {isCalibrating && (
                <div
                  style={{
                    position: "absolute",
                    top: dotPos.top + 40,
                    left: dotPos.left,
                    transform: "translate(-50%, -50%)",
                    color: "white",
                    fontSize: "1rem",
                    fontWeight: "bold",
                    zIndex: 2,
                    textShadow: "0 0 6px black",
                  }}
                >
                  {calibration.collected}/{calibration.total}
                </div>
              )}
            </>
          )}
      </div>

      {/* CALIBRATE BUTTON */}
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