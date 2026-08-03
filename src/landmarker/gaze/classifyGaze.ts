export type GazeDirection =
  | "LEFT"
  | "RIGHT"
  | "UP"
  | "DOWN"
  | "CENTER"
  | "INVALID";

export function classifyGazeDirection(
  x: number,
  y: number,
  valid: boolean,
  confidence: number
): GazeDirection {
  if (confidence < 0.3) return "INVALID";

  // If MediaPipe loses landmarks but confidence is high,
  // treat it as CENTER during calibration.
  if (!valid) return "CENTER";

  const H = 0.03;
  const V = 0.10;

  if (x > H) return "RIGHT";
  if (x < -H) return "LEFT";

  if (y > V) return "DOWN";
  if (y < -V) return "UP";

  return "CENTER";
}
