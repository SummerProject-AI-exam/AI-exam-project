
 export type AlertType =
  | "NO_FACE"
  | "MULTIPLE_FACES"
  | "CAMERA_OFF"
  | "CAMERA_BLOCKED"
  | "CAMERA_NOT_READY"
  | "CAMERA_READY"
  | "OK";


export interface AlertState {
  type: AlertType;
  timestamp: number;
}