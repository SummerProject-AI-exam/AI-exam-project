import React from "react";
import { useFaceLandmarker } from "../hooks/useFaceLandmarker";
import { useReadinessAlerts } from "../readinessAlerts/useReadinessAlerts";

export function ReadinessViewer() {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  // MediaPipe face tracking
  const { results: faceLandmarks } = useFaceLandmarker(videoRef);

  // Phase 1 readiness logic
  const { ok, alerts } = useReadinessAlerts(videoRef, faceLandmarks);

  return (
    <div>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{ width: 320, height: 240, background: "#000" }}
      />

      <div style={{ marginTop: 10 }}>
        <strong>READY:</strong> {ok ? "YES" : "NO"}
      </div>

      <div style={{ marginTop: 10 }}>
        <strong>ALERTS:</strong>
        {alerts.map((a) => (
          <div key={a}>{a}</div>
        ))}
      </div>
    </div>
  );
}
