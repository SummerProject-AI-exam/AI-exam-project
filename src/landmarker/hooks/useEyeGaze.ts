import { useRef } from "react"
import { useFaceLandmarker } from "./useFaceLandmarker"
import { useIrisLandmarker } from "./useIrisLandmarker"
import { computeEAR } from "../gaze/computeEAR"
import { computeIrisVisibility } from "../gaze/computeIrisVisibility"
import { computeGazeDirection } from "../gaze/computeGazeDirection"
import type { GazeValues } from "../types/GazeValues"

export function useEyeGaze(
  videoRef: React.RefObject<HTMLVideoElement | null>
) {

const face: any = useFaceLandmarker(videoRef).results

 const iris: any = useIrisLandmarker(videoRef)

  const lastValuesRef = useRef<GazeValues>({
    ear: null,
    eyesClosed: false,
    eyesNotVisible: true,
    gazeDirection: "CENTER",
    irisConfidence: 0,
    rawIrisPosition: null,
  })

  const lastComputeRef = useRef(0)
  const now = performance.now()

  const faceLandmarks = face?.faceLandmarks?.[0]
  if (!faceLandmarks || face?.unstable) {
    return lastValuesRef.current
  }

  const irisLandmarks = iris?.faceLandmarks?.[0]
  if (!irisLandmarks) {
    return lastValuesRef.current
  }

  if (now - lastComputeRef.current < 120) {
    return lastValuesRef.current
  }
  lastComputeRef.current = now

  const ear = computeEAR(irisLandmarks)
  if (ear === null) {
    return lastValuesRef.current
  }

  const eyesClosed = ear < 0.18

  const { irisConfidence, eyesNotVisible, rawIrisPosition } =
    computeIrisVisibility(irisLandmarks)

  if (irisConfidence === 0) {
    return lastValuesRef.current
  }

  const gazeDirection = computeGazeDirection(irisLandmarks, rawIrisPosition)

  lastValuesRef.current = {
    ear,
    eyesClosed,
    eyesNotVisible,
    gazeDirection,
    irisConfidence,
    rawIrisPosition,
  }

  return lastValuesRef.current
}
