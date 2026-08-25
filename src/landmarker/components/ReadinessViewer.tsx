import React, { useEffect, useRef, useState } from "react";
import { useWebcam } from "../hooks/useWebcam";
import { useFaceLandmarker } from "../hooks/useFaceLandmarker";

import { useCameraBlocked } from "../analysis/useCameraBlocked";
import { useCameraOff } from "../analysis/useCameraOff";
import { useFrameFrozen } from "../analysis/useFrameFrozen";
import { useLightingQuality } from "../analysis/useLightingQuality";

import { useReadinessAlerts } from "../readinessAlerts/useReadinessAlerts";
import { useCameraReady } from "../analysis/useCameraReady";

function useVideoTimestampFrozen(videoRef: React.RefObject<HTMLVideoElement>) {
  const [frozen, setFrozen] = useState(false);
  const lastTimeRef = useRef<number>(0);
  const lastCheckRef = useRef<number>(performance.now());

  useEffect(() => {
    const check = () => {
      const video = videoRef.current;
      if (!video) return;

      const now = performance.now();
      const dt = now - lastCheckRef.current;

      if (dt > 300) {
        const current = video.currentTime;
        setFrozen(current === lastTimeRef.current);
        lastTimeRef.current = current;
        lastCheckRef.current = now;
      }

      requestAnimationFrame(check);
    };

    requestAnimationFrame(check);
  }, [videoRef]);

  return frozen;
}

export function CombinedViewer() {
  const { videoRef, startCamera, stopCamera } = useWebcam();
  const videoRefNonNull = videoRef as React.RefObject<HTMLVideoElement>;

  const [phase1Done, setPhase1Done] = useState(false);

  const [readySince, setReadySince] = useState<number | null>(null);

  const { canvasRef, results } = useFaceLandmarker(videoRefNonNull, {
    fps: 10,
    maxDurationMs: 6000,
  });

  const cameraReady = useCameraReady(videoRefNonNull);

  const faceLandmarks = results?.faceLandmarks ?? [];
  const faceCount = faceLandmarks.length;

  const faceDetected = faceCount >= 1;

  const cameraBlocked = useCameraBlocked(videoRefNonNull, faceDetected);
  const cameraOff = useCameraOff(videoRefNonNull);
  const frameFrozen = useFrameFrozen(videoRefNonNull);
  const lighting = useLightingQuality(videoRefNonNull);

  const videoTimestampFrozen = useVideoTimestampFrozen(videoRefNonNull);

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

  const readinessImproving = readiness.ok || readySince !== null;

  const [freezeStart, setFreezeStart] = useState<number | null>(null);
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get("sessionId") ?? "";

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  useEffect(() => {
    if (!phase1Done) {
      if (readiness.ok) {
        if (readySince === null) {
          setReadySince(performance.now());
        }
      } else {
        setReadySince(null);
      }
    }
  }, [readiness.ok, phase1Done, readySince]);

  useEffect(() => {
    if (!phase1Done && readySince !== null) {
      const now = performance.now();
      if (now - readySince > 2500) {
        stopCamera();
        setPhase1Done(true);
      }
    }
  }, [readySince, phase1Done, stopCamera]);

  useEffect(() => {
    if (phase1Done) return;

    const now = performance.now();

    const frozen =
      frameFrozen ||
      videoTimestampFrozen ||
      cameraBlocked ||
      cameraOff ||
      faceCount === 0 ||
      lighting === "dark";

    if (frozen) {
      if (freezeStart === null) setFreezeStart(now);
    } else {
      setFreezeStart(null);
    }

    if (freezeStart && now - freezeStart > 6000) {
      if (!readinessImproving) {
        stopCamera();
        setPhase1Done(true);
      }
    }

  }, [
    frameFrozen,
    videoTimestampFrozen,
    cameraBlocked,
    cameraOff,
    faceCount,
    lighting,
    freezeStart,
    phase1Done,
    stopCamera,
  ]);

  useEffect(() => {
    if (!phase1Done && results === null) {
      if (!readinessImproving) {
        stopCamera();
        setPhase1Done(true);
      }
    }
  }, [results, phase1Done, readinessImproving, stopCamera]);


  return (
    <div
      style={{
        width: "100%",
        maxWidth: "900px",
        margin: "0 auto",
        paddingTop: "20px",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Header */}
      <h2
        style={{
          textAlign: "center",
          marginBottom: "12px",
          fontWeight: 600,
          color: "#222",
        }}
      >
        Camera Readiness Check
      </h2>

      {/* Video Container */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "900px",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          background: "#000",
          marginBottom: "20px",
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={{
            width: "100%",
            height: "100%",
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
            transform: "scaleX(-1)",
          }}
        />
      </div>

      {/* Camera starting message */}
      {!phase1Done && !cameraReady && (
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <h3 style={{ marginBottom: "4px" }}>Camera starting…</h3>
          <p style={{ color: "#555" }}>Please wait 1–2 seconds.</p>
        </div>
      )}

      {/* Calibration Box */}
      {phase1Done && (
        <div
          style={{
            marginTop: "10px",
            padding: "20px",
            borderRadius: "12px",
            background: "#fafafa",
            border: "1px solid #ddd",
            width: "100%",
            maxWidth: "480px",
            marginLeft: "auto",
            marginRight: "auto",
            boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h3 style={{ marginBottom: "12px", fontWeight: 600 }}>
            Calibration Results
          </h3>

          {readiness.ok ? (
            <div
              style={{
                color: "#0a7a0a",
                fontWeight: "bold",
                marginBottom: "12px",
              }}
            >
              ✓ Camera & environment look good
            </div>
          ) : (
            <div
              style={{
                color: "#b30000",
                fontWeight: "bold",
                marginBottom: "12px",
              }}
            >
              ⚠ Issues detected
            </div>
          )}

          {readiness.alerts.length > 0 && (
            <div
              style={{
                textAlign: "left",
                marginBottom: "16px",
                fontSize: "0.95rem",
                lineHeight: "1.4",
              }}
            >
              {readiness.alerts.map((a) => (
                <div key={a}>• {a}</div>
              ))}
            </div>
          )}

          {readiness.ok ? (
            <button
              onClick={() =>
                (window.location.href = `/monitor?sessionId=${sessionId}&ready=true`)
              }
              style={{
                padding: "12px 18px",
                background: "#0078ff",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                width: "100%",
                fontSize: "1rem",
                fontWeight: 500,
              }}
            >
              Start Monitoring
            </button>
          ) : (
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "12px 18px",
                background: "#e0e0e0",
                color: "#333",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                width: "100%",
                fontSize: "1rem",
                fontWeight: 500,
              }}
            >
              Redo Calibration
            </button>
          )}
        </div>
      )}
    </div>
  );

}