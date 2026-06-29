import type { GazeVector } from "./computeGazeVector";

export function smoothVector(
  previous: GazeVector,
  current: GazeVector,
  out: GazeVector,
  alpha = 0.25
): GazeVector {
  if (!current.valid) {
    out.x = 0;
    out.y = 0;
    out.valid = false;
    return out;
  }

  if (!previous.valid) {
    out.x = current.x;
    out.y = current.y;
    out.valid = true;
    return out;
  }

  out.x = previous.x * (1 - alpha) + current.x * alpha;
  out.y = previous.y * (1 - alpha) + current.y * alpha;
  out.valid = true;
  return out;
}
