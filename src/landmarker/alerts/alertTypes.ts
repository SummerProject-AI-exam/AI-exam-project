export type AlertType =
  | "NO_FACE"
  | "MULTIPLE_FACES"
  | "CAMERA_OFF"
  | "CAMERA_BLOCKED"
  | "CAMERA_NOT_READY"
  | "CAMERA_PERMISSION_DENIED"
  | "CAMERA_STREAM_FAILED"
  | "CAMERA_IMAGE_BLACK"
  | "CAMERA_IMAGE_FROZEN";

export interface AlertState {
  type: AlertType;
  timestamp: number;
}