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

export function CombinedViewer({
  mode = "training-demo",
  onReady,
}: {
  mode?: string;
  onReady?: () => void;
}) {

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

useEffect(() => {
  if (!phase1Done && !readiness.ok) {
    setPhase1Done(false);
    setReadySince(null);
  }
}, [readiness.ok, phase1Done]);


useEffect(() => {
  console.log("[DEBUG] cameraReady =", cameraReady);
}, [cameraReady]);

useEffect(() => {
  console.log("[DEBUG] readySince =", readySince);
}, [readySince]);

useEffect(() => {
  console.log("[DEBUG] phase1Done =", phase1Done);
}, [phase1Done]);

  const readinessImproving = readiness.ok || readySince !== null;

  const [freezeStart, setFreezeStart] = useState<number | null>(null);
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get("sessionId") ?? "";

  const isCameraCheck = mode === "camera-check";
  const isTrainingDemo = mode === "training-demo";

  const showCalibrationBox = !isCameraCheck;
  const showAlerts = !isCameraCheck;
  const showReadinessMessages = !isCameraCheck;


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
              //stopCamera();
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
            //stopCamera();
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
        //stopCamera();
        setPhase1Done(true);
      }
    }
  }, [results, phase1Done, readinessImproving, stopCamera]);


  return (
    <div style={{ width: 640, margin: "0 auto" }}>
      <div
        style={{
          position: "relative",
          width: 640,
          height: "auto",
          margin: "0 auto",
          marginTop: "20px",
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
            transform: "scaleX(-1)",
            transformOrigin: "center",
          }}
        />
      </div>

      {!phase1Done && !cameraReady && (
        <div>
          <h3>Camera starting…</h3>
          <p>Please wait 1–2 seconds.</p>
        </div>
      )}

      {phase1Done && showCalibrationBox && (
        <div
          style={{
            marginTop: "20px",
            padding: "16px",
            borderRadius: "8px",
            background: "#f7f7f7",
            border: "1px solid #ddd",
            width: "640px",
            textAlign: "center",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <h3 style={{ marginBottom: "8px" }}>Calibration Results</h3>

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

          {showAlerts && readiness.alerts.length > 0 && (
            <div
              style={{
                textAlign: "left",
                marginBottom: "12px",
                fontSize: "0.9rem",
              }}
            >
              {readiness.alerts.map((a) => (
                <div key={a}>• {a}</div>
              ))}
            </div>
          )}

          {showReadinessMessages && (
            readiness.ok ? (
              <button
                onClick={() => onReady?.()}
                style={{
                  padding: "10px 16px",
                  background: "#0078ff",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  width: "100%",
                  marginBottom: "8px",
                }}
              >
                Start Monitoring
              </button>
            ) : (
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: "10px 16px",
                  background: "#e0e0e0",
                  color: "#333",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                Redo Calibration
              </button>
            )
          )}

        </div>
      )}
    </div>
  );
}
