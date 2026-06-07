import React, { useEffect, useState } from "react";
import { useWebcam } from "../hooks/useWebcam";
import { useFaceLandmarker } from "../hooks/useFaceLandmarker";

import { useCameraBlocked } from "../analysis/useCameraBlocked";
import { useCameraOff } from "../analysis/useCameraOff";
import { useFrameFrozen } from "../analysis/useFrameFrozen";
import { useLightingQuality } from "../analysis/useLightingQuality";

import { useReadinessAlerts } from "../readinessAlerts/useReadinessAlerts";
import { useCameraReady } from "../analysis/useCameraReady";

export function CombinedViewer() {
  const { videoRef, startCamera, stopCamera } = useWebcam();
  const videoRefNonNull = videoRef as React.RefObject<HTMLVideoElement>;

  // ⭐ NEW: Track when Phase 1 is finished
  const [phase1Done, setPhase1Done] = useState(false);

  // ⭐ Phase 1 uses slow FPS + auto-stop
  const { canvasRef, results } = useFaceLandmarker(videoRefNonNull, {
    fps: 10,
    maxDurationMs: 6000, // 6 seconds for reliable calibration
  });

  const cameraReady = useCameraReady(videoRefNonNull);

  const faceLandmarks = results?.faceLandmarks ?? [];
  const faceCount = faceLandmarks.length;

  const faceDetected = faceCount === 1;

  const cameraBlocked = useCameraBlocked(videoRefNonNull, faceDetected);
  const cameraOff = useCameraOff(videoRefNonNull);
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

  // ⭐ Start camera on mount
  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  // ⭐ NEW: Early-stop when READY becomes true
  useEffect(() => {
    if (readiness.ok && !phase1Done) {
      console.log("Phase 1: READY early, stopping");
      stopCamera();
      setPhase1Done(true);
    }
  }, [readiness.ok, phase1Done, stopCamera]);

  // ⭐ NEW: Detect when auto-stop happened (results stop updating)
  useEffect(() => {
    if (!cameraReady && results === null && !phase1Done) {
      // Phase 1 ended due to timeout
      setPhase1Done(true);
    }
  }, [cameraReady, results, phase1Done]);

  return (
    <div>
      {/* Video + canvas */}
      <div
        style={{
          position: "relative",
          width: 320,
          height: 240,
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={{
            width: "100%",
            height: "100%",
            background: "#000",
            transform: "scaleX(-1)",
          }}
        />

        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            transform: "scaleX(-1)", // ⭐ Fix ghost landmarks
            transformOrigin: "center",
          }}
        />
      </div>

      {/* ⭐ UI logic updated so it never gets stuck */}
      {!phase1Done && !cameraReady && (
        <div>
          <h3>Camera starting…</h3>
          <p>Please wait 1–2 seconds.</p>
        </div>
      )}

      {phase1Done && (
        <>
          <h3>Phase 1 Readiness Alerts</h3>
          {readiness.alerts.map((a) => (
            <div key={a}>{a}</div>
          ))}

          <h3>READY?</h3>
          <div>{readiness.ok ? "YES" : "NO"}</div>
        </>
      )}
    </div>
  );
}
