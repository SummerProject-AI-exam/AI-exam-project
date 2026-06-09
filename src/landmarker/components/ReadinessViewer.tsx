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

  const [freezeStart, setFreezeStart] = useState<number | null>(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  useEffect(() => {
    if (!phase1Done && readiness.ok) {
      stopCamera();
      setPhase1Done(true);
    }
  }, [readiness.ok, phase1Done, stopCamera]);

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
      stopCamera();
      setPhase1Done(true);
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
      stopCamera();
      setPhase1Done(true);
    }
  }, [results, phase1Done, stopCamera]);



  return (
    <div>
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
