import { useEyeGaze } from './useEyeGaze'
import { useGazeAlerts } from '../gazeAlerts/useGazeAlerts'

export function useGazeMonitoring(
  videoRef: React.RefObject<HTMLVideoElement | null>
) {
  const gaze = useEyeGaze(videoRef)
  const alerts = useGazeAlerts(videoRef)

  return {
    timestamp: Date.now(),
    gazeDirection: gaze.gazeDirection,
    eyesClosed: gaze.eyesClosed,
    eyesNotVisible: gaze.eyesNotVisible,
    alerts,
  }
}
