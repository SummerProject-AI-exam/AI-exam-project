
import type { AlertState, AlertType } from "../alerts/alertTypes";

interface Props {
  alert: AlertState | null;
}

export function AlertPanel({ alert }: Props) {
  if (!alert) return null;

  const message: Record<AlertType, string> = {
    NO_FACE: "No face detected",
    MULTIPLE_FACES: "Multiple faces detected",
    CAMERA_OFF: "Camera is off",
    CAMERA_BLOCKED: "Camera is blocked",
    CAMERA_NOT_READY: "Camera is not ready",

    CAMERA_PERMISSION_DENIED: "Camera permission denied",
    CAMERA_STREAM_FAILED: "Camera stream failed",
    CAMERA_IMAGE_BLACK: "Camera image is black",
    CAMERA_IMAGE_FROZEN: "Camera image is frozen",
  };

  const color: Record<AlertType, string> = {
    NO_FACE: "#ff9800",
    MULTIPLE_FACES: "#e91e63",
    CAMERA_OFF: "#f44336",
    CAMERA_BLOCKED: "#9c27b0",
    CAMERA_NOT_READY: "#607d8b",

    CAMERA_PERMISSION_DENIED: "#d32f2f",
    CAMERA_STREAM_FAILED: "#c62828",
    CAMERA_IMAGE_BLACK: "#424242",
    CAMERA_IMAGE_FROZEN: "#0277bd",
  };

  return (
    <div
      style={{
        position: "absolute",
        bottom: "10px",
        left: "50%",
        transform: "translateX(-50%)",
        background: color[alert.type],
        color: "white",
        padding: "8px 14px",
        borderRadius: "6px",
        fontSize: "0.9rem",
        fontWeight: 600,
        zIndex: 50,
        boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
      }}
    >
      {message[alert.type]}
    </div>
  );
}
