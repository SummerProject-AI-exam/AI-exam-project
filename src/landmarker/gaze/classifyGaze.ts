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
  if (!valid || confidence < 0.3) return "INVALID";

  // Realistic thresholds (baseline-relative)
  const H = 0.04;   // horizontal threshold
  const V = 0.04;   // vertical threshold (was 0.001 → broken)

  // Horizontal
  if (x > H) return "RIGHT";
  if (x < -H) return "LEFT";

  // Vertical
  if (y > V) return "DOWN";     // meaningful downward drift
  if (y < -V) return "UP";      // meaningful upward drift

  return "CENTER";
}
