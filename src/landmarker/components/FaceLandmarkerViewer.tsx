import { useEffect, useRef } from "react";
import { useWebcam } from "../hooks/useWebcam";
import { useFPS } from "../hooks/useFPS";
import { useFaceLandmarker } from "../hooks/useFaceLandmarker";

import { useCameraBlocked } from "../analysis/useCameraBlocked";
import { useCameraOff } from "../analysis/useCameraOff";
import { AlertPanel } from "../ui/AlertPanel";
import { useAlerts } from "../alerts/useAlerts";

export default function FaceLandmarkerViewer() {
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get("sessionId") ?? "";

  const { videoRef, startCamera, stopCamera } = useWebcam();
  const { canvasRef, isLoaded, results, cameraReady } = useFaceLandmarker(videoRef);

  // FACE COUNT CHANGE LOG, SHOWS IF FACE COUNT CHNAGED
  const faceCount = results?.faceLandmarks?.length ?? 0;


  const prevFaceCountRef = useRef<number | null>(null);
  if (prevFaceCountRef.current !== faceCount) {
    console.log("FACE COUNT CHANGED:", {
      prev: prevFaceCountRef.current,
      now: faceCount,
      hasFace: faceCount > 0
    });
    prevFaceCountRef.current = faceCount;
  }

  const faceDetected = faceCount === 1;
  const cameraBlocked = useCameraBlocked(videoRef, faceDetected);
  const cameraOff = useCameraOff(videoRef);

  // ALERT INPUT CHANGE LOG. SHOWS CHANGED INPUT
  const alertInput = { faceCount, cameraReady, cameraBlocked, cameraOff };
  const prevAlertInputRef = useRef<any>(null);

  if (JSON.stringify(prevAlertInputRef.current) !== JSON.stringify(alertInput)) {
    console.log("ALERT INPUT CHANGED:", alertInput);
    prevAlertInputRef.current = alertInput;
  }

  const alert = useAlerts(alertInput, sessionId);


  const prevAlertRef = useRef<any>(null);
  if (prevAlertRef.current?.type !== alert?.type) {
    console.log("ALERT STATE CHANGED:", {
      prev: prevAlertRef.current?.type,
      now: alert?.type
    });
    prevAlertRef.current = alert;
  }

  const { fps, updateFPS } = useFPS();

 useEffect(() => {
  startCamera();
  return () => stopCamera();
}, [startCamera, stopCamera]);


  useEffect(() => {
    if (results) updateFPS();
  }, [results]);

return (
  <div
 style={{
    width: "100%",
    maxWidth: "900px",
    margin: "0 auto",
    background: "white",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px", 
  }}
  >

    {/* MAIN WINDOW */}
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "900px",
        height: "60vh",
        margin: "0 auto",
        borderRadius: "10px",
        background: "rgba(255,255,255,0.95)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        overflow: "hidden",
      }}
    >
      {!isLoaded && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(255,255,255,0.9)",
            color: "#000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.2rem",
            fontWeight: "bold",
            zIndex: 10,
          }}
        >
          Loading model…
        </div>
      )}

      <div
        style={{
          position: "absolute",
          top: "12px",
          left: "12px",
          background: "rgba(0,120,255,0.85)",
          color: "white",
          padding: "6px 10px",
          borderRadius: "6px",
          fontSize: "0.85rem",
          fontWeight: "bold",
          zIndex: 20,
        }}
      >
        FPS: {fps}
      </div>

      <video
        ref={videoRef}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: "scaleX(-1)",
        }}
        playsInline
        muted
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

    <div
      style={{
        maxWidth: "900px",
        margin: 0,
        padding: 0,
      }}
    >
      <AlertPanel alert={alert} />
    </div>
  </div>
);

}
