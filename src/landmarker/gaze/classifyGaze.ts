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
  valid: boolean
): GazeDirection {
  if (!valid) return "INVALID";

  const H = 0.03; 
  const V = 0.001; 

  // Horizontal
  if (x > H) return "RIGHT";
  if (x < -H) return "LEFT";

  // Vertical
  if (y > V) return "DOWN";
  if (y < -V) return "UP";

  return "CENTER";
}
