import type { GazeVector } from "./computeGazeVector";

export function smoothVector(
  previous: GazeVector,
  current: GazeVector,
  out: GazeVector,
  alphaX = 0.25,
  alphaY = 0.15
): GazeVector {

  // if not valid
  if (!current.valid) {
    out.x = previous.x;
    out.y = previous.y;
    out.valid = previous.valid;

    // keep previous drift/stability/confidence
    out.drift = previous.drift;
    out.stability = previous.stability;
    out.confidence = previous.confidence;

    return out;
  }

  // first valid frame
  if (!previous.valid) {
    out.x = current.x;
    out.y = current.y;
    out.valid = true;

    // copy fresh values
    out.drift = current.drift;
    out.stability = current.stability;
    out.confidence = current.confidence;

    return out;
  }

  // smoothing
  out.x = previous.x * (1 - alphaX) + current.x * alphaX;
  out.y = previous.y * (1 - alphaY) + current.y * alphaY;
  out.valid = true;

  // copy fresh values
  out.drift = current.drift;
  out.stability = current.stability;
  out.confidence = current.confidence;

  return out;
}
