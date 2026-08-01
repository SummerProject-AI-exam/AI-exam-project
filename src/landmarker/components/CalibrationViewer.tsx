import { useEffect, useRef } from "react"
import { useWebcam } from "../hooks/useWebcam"
import { useFaceLandmarker } from "../hooks/useFaceLandmarker"
import { useEyeGaze } from "../hooks/useEyeGaze"
import { useCalibration } from "../hooks/useCalibration"
import { logFraudEvent } from "../alerts/logFraudEvent"

export function CalibrationViewer({ sessionId }: { sessionId: string }) {

    const { videoRef, startCamera, stopCamera } = useWebcam()

    useEffect(() => {
        startCamera()
        return () => stopCamera()
    }, [startCamera, stopCamera])

    const videoRefStable = videoRef as React.RefObject<HTMLVideoElement>
    const { canvasRef, results } = useFaceLandmarker(videoRefStable, {
        fps: 15,
        maxDurationMs: undefined,
    })

    const calibration = useCalibration(videoRefStable)
    const gaze = useEyeGaze(videoRefStable)

    //console.log("[GAZE RAW]", gaze)

useEffect(() => {
  let lastLogTime = 0;

  const interval = setInterval(() => {
    const now = performance.now();
    if (now - lastLogTime < 300) return; 
    lastLogTime = now;

    if (!calibration.isCalibrated) {
      console.log(
        "[CALIB SAMPLE]",
        "EAR:", gaze.ear?.toFixed(3),
        "iris:", gaze.irisConfidence.toFixed(2),
        "dir:", gaze.gazeDirection,
        "closed:", gaze.eyesClosed,
        "visible:", !gaze.eyesNotVisible
      );
    }
  }, 300);

  return () => clearInterval(interval);
}, [
  calibration.isCalibrated,
  gaze.ear,
  gaze.irisConfidence,
  gaze.gazeDirection,
  gaze.eyesClosed,
  gaze.eyesNotVisible
]);


    const videoContainerRef = useRef<HTMLDivElement>(null)
    const dotPosRef = useRef({ top: 0, left: 0 })

    useEffect(() => {
        const updateDot = () => {
            const box = videoContainerRef.current?.getBoundingClientRect()
            if (!box) return
            dotPosRef.current = {
                top: box.height * 0.5,
                left: box.width * 0.5,
            }
        }
        updateDot()
        window.addEventListener("resize", updateDot)
        return () => window.removeEventListener("resize", updateDot)
    }, [])

    const dotPos = dotPosRef.current

    const hasLoggedReady = useRef(false);

    useEffect(() => {
        if (!calibration.isCalibrated) return;
        if (hasLoggedReady.current) return;

        hasLoggedReady.current = true;

        logFraudEvent({
            sessionId,
            eventType: "GAZE_CALIBRATION_READY"
        });
    }, [calibration.isCalibrated, sessionId]);

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

                {calibration.isCalibrated === false && (
                    <div
                        style={{
                            position: "absolute",
                            width: 30,
                            height: 30,
                            borderRadius: "50%",
                            background: "red",
                            transform: "translate(-50%, -50%)",
                            top: dotPos.top,
                            left: dotPos.left,
                            zIndex: 2,
                            pointerEvents: "none",
                        }}
                    />
                )}
            </div>

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
                <div>Calibrated: {calibration.isCalibrated ? "yes" : "no"}</div>
                {calibration.baseline && (
                    <>
                        <div>Baseline EAR: {calibration.baseline.ear?.toFixed(3)}</div>
                        <div>
                            Baseline iris confidence:{" "}
                            {calibration.baseline.irisConfidence.toFixed(2)}
                        </div>
                        <div>Baseline direction: {calibration.baseline.centerDirection}</div>
                    </>
                )}
            </div>

            <div
                style={{
                    position: "absolute",
                    bottom: "10px",
                    left: "220px",
                    background: "rgba(0,0,0,0.6)",
                    color: "white",
                    padding: "6px 10px",
                    borderRadius: "4px",
                    fontSize: "0.75rem",
                    lineHeight: "1.2rem",
                    zIndex: 9999,
                }}
            >
                <div>Direction: {gaze.gazeDirection}</div>
                <div>EAR: {gaze.ear?.toFixed(3) ?? "n/a"}</div>
                <div>Eyes closed: {gaze.eyesClosed ? "yes" : "no"}</div>
                <div>Eyes visible: {gaze.eyesNotVisible ? "no" : "yes"}</div>
                <div>Iris confidence: {gaze.irisConfidence.toFixed(2)}</div>
            </div>

            <button
                onClick={calibration.startCalibration}
                style={{
                    position: "absolute",
                    bottom: "10px",
                    right: "10px",
                    zIndex: 9999,
                }}
            >
                Calibrate
            </button>
        </div>
    )
}
