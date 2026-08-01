import { useEffect, useRef } from "react"
import { useWebcam } from "../hooks/useWebcam"
import { useFaceLandmarker } from "../hooks/useFaceLandmarker"
import { useGazeMonitoring } from "../hooks/useGazeMonitoring"

export function GazeAlertsViewer({ sessionId }: { sessionId: string }) {
  const { videoRef, startCamera, stopCamera } = useWebcam()

  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [startCamera, stopCamera])

  const videoRefStable = videoRef as React.RefObject<HTMLVideoElement>
  const { canvasRef, results } = useFaceLandmarker(videoRefStable, {
    fps: 10,
    maxDurationMs: undefined,
  })

  const monitoring = useGazeMonitoring(videoRefStable)

  const videoContainerRef = useRef<HTMLDivElement>(null)

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
      {!results && (
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
            zIndex: 10000,
          }}
        >
          Loading model…
        </div>
      )}

      <div
        ref={videoContainerRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 1,
        }}
      >
        <video
          ref={videoRef}
          style={{ width: "100%", height: "100%", transform: "scaleX(-1)" }}
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
            zIndex: 0,
          }}
        />
      </div>

      {/* Gaze + alerts debug */}
      <div
        style={{
          position: "absolute",
          bottom: "10px",
          left: "10px",
          background: "rgba(0,0,0,0.6)",
          color: "white",
          padding: "6px 10px",
          borderRadius: "4px",
          fontSize: "0.8rem",
          zIndex: 9999,
        }}
      >
        <div>Timestamp: {new Date(monitoring.timestamp).toLocaleTimeString()}</div>
        <div>Direction: {monitoring.gazeDirection}</div>
        <div>Eyes closed: {monitoring.eyesClosed ? "yes" : "no"}</div>
        <div>Eyes visible: {monitoring.eyesNotVisible ? "no" : "yes"}</div>
      </div>

      {/* Alerts list */}
      <div
        style={{
          position: "absolute",
          bottom: "10px",
          left: "220px",
          background: "rgba(0,0,0,0.6)",
          color: "white",
          padding: "6px 10px",
          borderRadius: "4px",
          fontSize: "0.8rem",
          zIndex: 9999,
        }}
      >
        <div>Alerts:</div>
        {monitoring.alerts.length === 0 ? (
          <div>None</div>
        ) : (
          monitoring.alerts.map((a, i) => (
            <div key={i}>{a}</div>
          ))
        )}
      </div>
    </div>
  )
}
