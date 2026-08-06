import { useEffect, useState } from "react";
import { useWebcam } from "../hooks/useWebcam";
import { useFaceLandmarker } from "../hooks/useFaceLandmarker";
import { useGaze } from "../hooks/useGaze";
import { useFraudGazeAlerts } from "../hooks/useFraudGazeAlerts";
import { useAlertsGaze } from "../alerts/useAlertsGaze";
import { useGazeAlerts } from "../hooks/useGazeAlerts";

export function GazeAlertViewer({ sessionId }: { sessionId: string }) {

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
    calibration,
    gazeFrame,
    dynamicRate,
    setBaseline,
    setCalibrationState
  } = useGaze(results);

  const [startExam, setStartExam] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const { alert: gazeAlert, warmupCountdown } = useGazeAlerts(
    calibration.state,
    baseline,
    gazeFrame,
    dynamicRate,
    startExam
  );

  useEffect(() => {
    const saved = localStorage.getItem("gazeBaseline");
    if (saved) {
      const loaded = JSON.parse(saved);

      // Only accept stabilized baselines
      if (loaded && loaded.stabilized) {
        setBaseline(loaded);
        setCalibrationState("MONITORING");
      }
    }
  }, []);

  const monitoringActive = calibration.state === "MONITORING";

  const monitoring = {
    valid: gazeFrame.valid,
    direction: gazeFrame.direction,
    drift: gazeFrame.drift,
  };

  useFraudGazeAlerts(monitoring, gazeFrame, baseline, sessionId);
  useAlertsGaze(gazeAlert, sessionId);

  useEffect(() => {
    if (countdown === null) return;

    if (countdown === 0) {
      setStartExam(true);
      setCountdown(null);
      return;
    }

    const t = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

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
      {/* VIDEO */}
      <video
        ref={videoRef}
        style={{ width: "100%", height: "100%", transform: "scaleX(-1)" }}
        autoPlay
        playsInline
        muted
      />

      {/* FACE MESH */}
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

      {/* UI OVERLAY */}
      <div
        style={{
          position: "absolute",
          bottom: "10px",
          left: "10px",
          background: "rgba(0,0,0,0.6)",
          color: "white",
          padding: "10px 14px",
          borderRadius: "4px",
          fontSize: "0.85rem",
          lineHeight: "1.2rem",
          zIndex: 9999,
          minWidth: "260px",
        }}
      >
        {/* ⭐ Start Exam Button */}
        {!startExam && countdown === null && (
          <button
            onClick={() => setCountdown(3)}
            style={{
              padding: "8px 12px",
              background: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              marginBottom: "10px",
            }}
          >
            Start Exam
          </button>
        )}

        {/* ⭐ Visible countdown */}
        {countdown !== null && (
          <div style={{ fontWeight: "bold", marginBottom: "10px" }}>
            Exam starting in: {countdown}
          </div>
        )}

        {/* ⭐ Warm-up countdown */}
        {startExam && warmupCountdown !== null && (
          <div style={{ fontWeight: "bold", marginBottom: "10px" }}>
            Warm-up: {warmupCountdown}
          </div>
        )}

        <div style={{ fontWeight: "bold", marginBottom: "6px" }}>
          Monitoring: {monitoringActive ? "Active" : "Inactive"}
        </div>

        {/* ⭐ REAL GAZE DATA */}
        <div>Direction: {gazeFrame.direction}</div>
        <div>Drift: {gazeFrame.drift.toFixed(3)}</div>
        <div>Stable: {gazeFrame.stable ? "yes" : "no"}</div>
        <div>Centered: {gazeFrame.centered ? "yes" : "no"}</div>
        <div>Confidence: {gazeFrame.confidence.toFixed(2)}</div>
        <div>Valid: {gazeFrame.valid ? "yes" : "no"}</div>
        <div>
          Pos: ({gazeFrame.x.toFixed(3)}, {gazeFrame.y.toFixed(3)})
        </div>

        <div style={{ marginTop: "10px", fontWeight: "bold" }}>
          Alert: {gazeAlert ?? "None"}
        </div>
      </div>
    </div>
  );
}
