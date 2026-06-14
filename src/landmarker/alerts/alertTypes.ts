export type AlertType =
  | "NO_FACE"
  | "MULTIPLE_FACES"
  | "CAMERA_OFF"
  | "CAMERA_BLOCKED"
  | "CAMERA_NOT_READY"
  | "POSE_TOO_LEFT"
  | "POSE_TOO_RIGHT"
  | "POSE_TOO_DOWN"
  | "POSE_TOO_UP"

export interface AlertState {
  type: AlertType;
  timestamp: number;
}