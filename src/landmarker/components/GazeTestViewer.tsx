import { useEffect, useRef, useState } from "react";
import { useWebcam } from "../hooks/useWebcam";
import { useFaceLandmarker } from "../hooks/useFaceLandmarker";
import { useGaze } from "../hooks/useGaze";
import { logFraudEvent } from "../alerts/logFraudEvent";
import { useFraudGazeAlerts } from "../hooks/useFraudGazeAlerts";

type Baseline = {
  x: number;
  y: number;
  centerX: number;
  centerY: number;
  horizontalThreshold: number;
  verticalThreshold: number;
  driftThreshold: number;
  stabilized?: boolean;
} | null;

export function GazeTestViewer() {
  // CAMERA
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
}: {
  baseline: Baseline;
  isCalibrating: boolean;
  countdown: number | null;
  startCalibration: () => void;
  calibration: any;
  debug: any;
} = useGaze(results);


  const monitoring = {
  valid: debug.valid,
  direction: debug.direction,
  drift: debug.drift,
};


const params = new URLSearchParams(window.location.search);
const sessionId = params.get("sessionId") ?? "";

useFraudGazeAlerts(monitoring, debug, baseline, sessionId);

  useEffect(() => {
    if (calibration.state === "MONITORING" && baseline) {
      logFraudEvent({
        sessionId,
        eventType: "CALIBRATION_READY"
      });
    }
  }, [calibration.state, baseline]);


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
      {/* MODEL LOADING OVERLAY */}
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

      {/* VIDEO + FACE MESH */}
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
        {(isCalibrating || countdown !== null) && (
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

      {/* SAMPLE LOG BOX */}
      <pre
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          width: "300px",
          height: "300px",
          background: "rgba(0,0,0,0.6)",
          color: "white",
          padding: "10px",
          borderRadius: "4px",
          fontSize: "0.75rem",
          overflowY: "auto",
          whiteSpace: "pre-wrap",
          zIndex: 9999,
        }}
      >
        {sampleLog}
      </pre>

      {/* CALIBRATION LOGS */}
      <div
        style={{
          position: "absolute",
          bottom: "10px",
          left: "10px",
          background: "rgba(0,0,0,0.6)",
          color: "white",
          padding: "6px 10px",
          borderRadius: "4px",
          fontSize: "0.8rem",
          zIndex: 9999,
        }}
      >
        <div>State: {calibration.state}</div>
        <div>Collected: {calibration.collected}/{calibration.total}</div>
        <div>Variance: {calibration.variance.toFixed(4)}</div>
        <div>Spread: {calibration.spread.toFixed(4)}</div>
        <div>Cooperating: {calibration.cooperating ? "yes" : "no"}</div>
        {baseline && (
          <div>
            Baseline: ({baseline.x.toFixed(3)}, {baseline.y.toFixed(3)})
          </div>
        )}
      </div>

      {/* DEBUG INFO */}
      <div
        style={{
          position: "absolute",
          bottom: "10px",
          left: "200px",
          background: "rgba(0,0,0,0.6)",
          color: "white",
          padding: "6px 10px",
          borderRadius: "4px",
          fontSize: "0.75rem",
          lineHeight: "1.2rem",
          zIndex: 9999,
        }}
      >
        <div>Direction: {debug.direction}</div>
        <div>Drift: {debug.drift.toFixed(3)}</div>
        <div>Stable: {debug.stability}</div>
        <div>Valid: {debug.valid ? "yes" : "no"}</div>
        <div>Confidence: {debug.confidence.toFixed(2)}</div>
        <div>Vector: {debug.vectorMagnitude.toFixed(3)}</div>
        <div>
          Pos: ({debug.x.toFixed(3)}, {debug.y.toFixed(3)})
        </div>
      </div>

      {/* PERFORMANCE DEBUG */}
      <div
        style={{
          position: "absolute",
          bottom: "10px",
          left: "380px",
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
