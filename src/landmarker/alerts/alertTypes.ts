export type AlertType =
  | "NO_FACE"
  | "MULTIPLE_FACES"
  | "CAMERA_OFF"
  | "CAMERA_BLOCKED"
  | "CAMERA_NOT_READY"
  | "TOO_CLOSE"        
  | "TOO_FAR"          
  | null;


export interface AlertState {
  type: AlertType;
  timestamp: number;
}