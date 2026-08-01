import { useState } from "react"
import { useEyeGaze } from "./useEyeGaze"

export function useCalibration(
  videoRef: React.RefObject<HTMLVideoElement | null>
) {
  const gaze = useEyeGaze(videoRef)

  const [baseline, setBaseline] = useState<null | {
    ear: number | null
    irisConfidence: number
    centerDirection: string
  }>(null)

  function startCalibration() {
    // Only calibrate if face is visible and eyes are open
    if (gaze.eyesClosed || gaze.eyesNotVisible || gaze.ear === null) {
      console.log("[CALIB] cannot start — face not ready")
      return
    }

    // One-shot snapshot, no loop
    setBaseline({
      ear: gaze.ear ?? 0,
      irisConfidence: gaze.irisConfidence,
      centerDirection: gaze.gazeDirection,
    })

    console.log(
      "[CALIB BASELINE]",
      "EAR:", gaze.ear !== null ? gaze.ear.toFixed(3) : "n/a",
      "iris:", gaze.irisConfidence.toFixed(2),
      "dir:", gaze.gazeDirection
    )
  }

  return {
    baseline,
    isCalibrated: baseline !== null,
    startCalibration,
  }
}
