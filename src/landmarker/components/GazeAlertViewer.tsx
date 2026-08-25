import { useEffect, useState } from "react";
import { useWebcam } from "../hooks/useWebcam";
import { useFaceLandmarker } from "../hooks/useFaceLandmarker";
import { useGaze } from "../hooks/useGaze";
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

  /*   console.log("[GAZE ALERT INPUT]", {
    state: calibration.state,
    baseline,
    gazeFrame,
    dynamicRate,
    startExam,
    results,
  }); */

  /* const { alert: gazeAlert, warmupCountdown } = useGazeAlerts(
    calibration.state,
    baseline,
    gazeFrame,
    dynamicRate,
    startExam,
    results,
    sessionId
  ); */

  const { alert: gazeAlert, warmupCountdown } = useGazeAlerts(
    calibration.state,
    baseline,
    gazeFrame,
    startExam,
    results,
    sessionId,
    dynamicRate
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

  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (gazeAlert) {
      setShowAlert(true);

      const t = setTimeout(() => {
        setShowAlert(false);
      }, 3000);

      return () => clearTimeout(t);
    } else {
      setShowAlert(false);
    }
  }, [gazeAlert]);


  return (
    <div style={{ width: "100%", maxWidth: "900px", margin: "0 auto" }}>

      <h2 style={{ textAlign: "center", marginBottom: "10px" }}>
        Monitoring Active
      </h2>

      {showAlert && (
        <div
          style={{
            background: "rgba(255,0,0,0.85)",
            color: "white",
            padding: "10px 16px",
            borderRadius: "6px",
            fontSize: "0.95rem",
            fontWeight: "bold",
            marginBottom: "10px",
            textAlign: "center",
          }}
        >
          Gaze alert: {gazeAlert}
        </div>
      )}

      {/* CAMERA WINDOW */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "60vh",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <video
          ref={videoRef}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: "scaleX(-1)",
          }}
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
            zIndex: 1,
          }}
        />
      </div>

      <div style={{ display: "none" }}>
        {gazeFrame.direction}
        {gazeFrame.drift}
        {gazeFrame.stable ? "yes" : "no"}
        {gazeFrame.centered ? "yes" : "no"}
        {gazeFrame.confidence}
        {gazeFrame.valid ? "yes" : "no"}
        {gazeFrame.x}
        {gazeFrame.y}
      </div>

      {/* UI OVERLAY */}
      <div
        style={{
          marginTop: "10px",
          background: "rgba(255,255,255,0.9)",
          color: "#000",
          padding: "10px 14px",
          borderRadius: "4px",
          fontSize: "0.85rem",
          lineHeight: "1.2rem",
        }}
      >
        {!startExam && countdown === null && (
          <button
            onClick={() => setCountdown(3)}
            style={{
              padding: "8px 12px",
              background: "#0078ff",
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

        {countdown !== null && (
          <div style={{ fontWeight: "bold", marginBottom: "10px" }}>
            Exam starting in: {countdown}
          </div>
        )}

        {startExam && warmupCountdown !== null && (
          <div style={{ fontWeight: "bold", marginBottom: "10px" }}>
            Warm-up: {warmupCountdown}
          </div>
        )}

        <div style={{ fontWeight: "bold", marginBottom: "6px" }}>
          Monitoring: {monitoringActive ? "Active" : "Inactive"}
        </div>

        {showAlert && (
          <div style={{ marginTop: "10px", fontWeight: "bold" }}>
            Alert: {gazeAlert}
          </div>
        )}
      </div>
    </div>
  );

}
