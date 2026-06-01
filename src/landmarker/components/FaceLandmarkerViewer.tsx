import { useEffect } from "react";
import { useWebcam } from "../hooks/useWebcam";
import { useFPS } from "../hooks/useFPS";
import { useFaceLandmarker } from "../hooks/useFaceLandmarker";

import { useCameraBlocked } from "../analysis/useCameraBlocked";
import { useCameraOff } from "../analysis/useCameraOff";
import { AlertPanel } from "../ui/AlertPanel";
import { useAlerts } from "../alerts/useAlerts";


export default function FaceLandmarkerViewer() {
  const { videoRef, startCamera, stopCamera } = useWebcam();
  const { canvasRef, isLoaded, results, cameraReady } = useFaceLandmarker(videoRef);
  const faceCount = results?.faceLandmarks?.length ?? 0;
  const faceDetected = faceCount === 1;
  const cameraBlocked = useCameraBlocked(videoRef, faceDetected);
  const cameraOff = useCameraOff(videoRef);

  const alert = useAlerts({
  faceCount,
  cameraReady,
  cameraBlocked,
  cameraOff,
});

  const { fps, updateFPS } = useFPS();

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  useEffect(() => {
    if (results) updateFPS();
  }, [results]);

  return (
    <div
      style={{
        position: "relative",
        width: "640px",
        maxWidth: "100%",
        margin: "0 auto",
      }}
    >
      {!isLoaded && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.2rem",
            zIndex: 10,
          }}
        >
          Loading model…
        </div>
      )}

      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          background: "rgba(0,0,0,0.6)",
          color: "white",
          padding: "4px 8px",
          borderRadius: "4px",
          fontSize: "0.8rem",
          zIndex: 20,
        }}
      >
        FPS: {fps}
      </div>

      <video
        ref={videoRef}
        style={{ width: "100%", transform: "scaleX(-1)" }}
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
      <AlertPanel alert={alert} />
    </div>
  );
}