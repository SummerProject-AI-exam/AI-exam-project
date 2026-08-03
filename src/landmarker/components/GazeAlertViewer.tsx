import { useEffect, useState } from "react";
import { useWebcam } from "../hooks/useWebcam";
import { useFaceLandmarker } from "../hooks/useFaceLandmarker";
import { useGaze } from "../hooks/useGaze";
import { useFraudGazeAlerts } from "../hooks/useFraudGazeAlerts";
import type { GazeAlertType } from "../gazeAlerts/alertTypesGaze";
import { useAlertsGaze } from "../alerts/useAlertsGaze";

export function GazeAlertViewer({ sessionId }: { sessionId: string }) {

  const { videoRef, startCamera, stopCamera } = useWebcam();

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const videoRefStable = videoRef as React.RefObject<HTMLVideoElement>;

  const {
    canvasRef,
    results
  } = useFaceLandmarker(videoRefStable, {
    fps: 10,
    maxDurationMs: undefined,
  });

  const {
    baseline,
    calibration,
    debug,
    alerts,
    setBaseline,
    setCalibrationState
  } = useGaze(results);

  // ⭐ Load baseline from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("gazeBaseline");
    if (saved) {
      const baseline = JSON.parse(saved);
      setBaseline(baseline);
      setCalibrationState("MONITORING");
    }
  }, []);

  const monitoringActive = calibration.state === "MONITORING";

  const monitoring = {
    valid: debug.valid,
    direction: debug.direction,
    drift: debug.drift,
  };
  useFraudGazeAlerts(monitoring, debug, baseline, sessionId);

  const [currentAlert, setCurrentAlert] = useState<string | null>(null);

  useEffect(() => {
    if (!monitoringActive) {
      setCurrentAlert(null);
      return;
    }

    if (alerts.length > 0) {
      setCurrentAlert(alerts[alerts.length - 1]);
    } else {
      setCurrentAlert(null);
    }
  }, [alerts, monitoringActive]);

  useAlertsGaze(currentAlert as GazeAlertType | null, sessionId);
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

      {/* ALERT BOX */}
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
        <div style={{ fontWeight: "bold", marginBottom: "6px" }}>
          Monitoring: {monitoringActive ? "Active" : "Inactive"}
        </div>

        <div>Direction: {debug.direction}</div>
        <div>Drift: {debug.drift.toFixed(3)}</div>
        <div>Stability: {debug.stability.toFixed(2)}</div>
        <div>Confidence: {debug.confidence.toFixed(2)}</div>
        <div>Valid: {debug.valid ? "yes" : "no"}</div>
        <div>
          Pos: ({debug.x.toFixed(3)}, {debug.y.toFixed(3)})
        </div>

        <div style={{ marginTop: "10px", fontWeight: "bold" }}>
          Alert: {currentAlert ?? "None"}
        </div>
      </div>
    </div>
  );
}
