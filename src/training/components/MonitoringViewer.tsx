import { useEffect } from "react";

import { useWebcam } from "../../landmarker/hooks/useWebcam";
import { useFaceLandmarker } from "../../landmarker/hooks/useFaceLandmarker";

// CAMERA ALERT ENGINE (CombinedViewer)
import { useCameraReady } from "../../landmarker/analysis/useCameraReady";
import { useCameraBlocked } from "../../landmarker/analysis/useCameraBlocked";
import { useCameraOff } from "../../landmarker/analysis/useCameraOff";
import { useFrameFrozen } from "../../landmarker/analysis/useFrameFrozen";
import { useLightingQuality } from "../../landmarker/analysis/useLightingQuality";
import { useReadinessAlerts } from "../../landmarker/readinessAlerts/useReadinessAlerts";

// GAZE ENGINE (GazeAlertViewer)
import { useGaze } from "../../landmarker/hooks/useGaze";
import { useGazeAlerts } from "../../landmarker/hooks/useGazeAlerts";

export default function MonitoringViewer({ sessionId }: { sessionId: string }) {

  // CAMERA + LANDMARKS
  const { videoRef, startCamera } = useWebcam();
  const videoRefNonNull = videoRef as React.RefObject<HTMLVideoElement>;
 const { canvasRef, results } = useFaceLandmarker(videoRefNonNull, {
  fps: 10,
  maxDurationMs: 6000,
});

  useEffect(() => {
    startCamera();
  }, [startCamera]);

  // CAMERA ALERTS
  const faceLandmarks = results?.faceLandmarks ?? [];
  const faceCount = faceLandmarks.length;
  const faceDetected = faceCount >= 1;

  const cameraReady = useCameraReady(videoRef);
  const cameraBlocked = useCameraBlocked(videoRef, faceDetected);
  const cameraOff = useCameraOff(videoRef);
  const frameFrozen = useFrameFrozen(videoRefNonNull);
const lighting = useLightingQuality(videoRefNonNull);

  const readiness = useReadinessAlerts({
    videoRef: videoRefNonNull,
    faceLandmarks,
    faceCount,
    cameraReady,
    cameraBlocked,
    cameraOff,
    frameFrozen,
    lighting,
  });

  // GAZE ENGINE
  const {
    baseline,
    calibration,
    gazeFrame,
    dynamicRate,
    setBaseline,
    setCalibrationState
  } = useGaze(results);

  useEffect(() => {
  setCalibrationState("MONITORING");
}, []);

  // GAZE ALERTS
  const { alert: gazeAlert } = useGazeAlerts(
    calibration.state,
    baseline,
    gazeFrame,
    true,        
    results,
    sessionId,
    dynamicRate
  );

  return (
    <div style={{ position: "relative", width: 640 }}>
      {/* CAMERA */}
      <video ref={videoRef} style={{ width: "100%" }} />

      {/* LANDMARKS */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      />

      {/* CAMERA ALERTS OVERLAY */}
      {readiness.alerts.length > 0 && (
        <div
          style={{
            position: "absolute",
            bottom: 10,
            left: 10,
            background: "rgba(0,0,0,0.7)",
            color: "white",
            padding: "8px 12px",
            borderRadius: 6,
            fontSize: "0.9rem",
            zIndex: 10,
          }}
        >
          {readiness.alerts.map((a) => (
            <div key={a}>• {a}</div>
          ))}
        </div>
      )}

      {/* GAZE ALERT OVERLAY */}
      {gazeAlert && (
        <div
          style={{
            position: "absolute",
            bottom: 10,
            right: 10,
            background: "rgba(255,0,0,0.7)",
            color: "white",
            padding: "8px 12px",
            borderRadius: 6,
            fontSize: "0.9rem",
            zIndex: 10,
          }}
        >
          {gazeAlert}
        </div>
      )}
    </div>
  );
}
