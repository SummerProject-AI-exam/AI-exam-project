import type { AlertState } from "../alerts/alertTypes";

interface Props {
  alert: AlertState | null;
}

export function AlertPanel({ alert }: Props) {
  if (!alert) return null;

  const message = {
    NO_FACE: "No face detected",
    MULTIPLE_FACES: "Multiple faces detected",
    CAMERA_OFF: "Camera is off",
    CAMERA_BLOCKED: "Camera is blocked",
    CAMERA_NOT_READY: "Camera is not ready",
    POSE_TOO_LEFT: "Head turned left",
    POSE_TOO_RIGHT: "Head turned right",
    POSE_TOO_DOWN: "Head tilted down",
    POSE_TOO_UP: "Head tilted up",
  }[alert.type];

  const color = {
    NO_FACE: "#ff9800",
    MULTIPLE_FACES: "#e91e63",
    CAMERA_OFF: "#f44336",
    CAMERA_BLOCKED: "#9c27b0",
    CAMERA_NOT_READY: "#607d8b",
    POSE_TOO_LEFT: "#3f51b5",
    POSE_TOO_RIGHT: "#3f51b5",
    POSE_TOO_DOWN: "#3f51b5",
    POSE_TOO_UP: "#3f51b5",
  }[alert.type];

  return (
    <div
      style={{
        position: "absolute",
        bottom: "10px",
        left: "50%",
        transform: "translateX(-50%)",
        background: color,
        color: "white",
        padding: "8px 14px",
        borderRadius: "6px",
        fontSize: "0.9rem",
        fontWeight: 600,
        zIndex: 50,
        boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
      }}
    >
      {message}
    </div>
  );
}