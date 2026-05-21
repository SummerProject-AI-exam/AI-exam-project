
export type AlertType =
  | "NO_FACE"
  | "MULTIPLE_FACES"
  | "CAMERA_OFF"
  | "CAMERA_BLOCKED"
  | "CAMERA_NOT_READY";

export interface CameraState {
  ready: boolean;
  blocked: boolean;
  off: boolean;
}

export interface FaceState {
  faceCount: number;
}

export interface AlertState {
  type: AlertType;
  timestamp: number;
}
