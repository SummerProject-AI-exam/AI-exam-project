import { useEyeGaze } from '../hooks/useEyeGaze'
import type { GazeAlertType } from './alertTypesGaze'

export function useGazeAlerts(
  videoRef: React.RefObject<HTMLVideoElement | null>
): GazeAlertType[] {
  const gaze = useEyeGaze(videoRef)
  const alerts: GazeAlertType[] = []

  if (gaze.eyesClosed) alerts.push('EYES_CLOSED')
  if (gaze.eyesNotVisible) alerts.push('EYES_NOT_VISIBLE')

  if (gaze.gazeDirection === 'LEFT') alerts.push('LOOKING_LEFT')
  if (gaze.gazeDirection === 'RIGHT') alerts.push('LOOKING_RIGHT')
  if (gaze.gazeDirection === 'UP') alerts.push('LOOKING_UP')
  if (gaze.gazeDirection === 'DOWN') alerts.push('LOOKING_DOWN')

  return alerts
}
