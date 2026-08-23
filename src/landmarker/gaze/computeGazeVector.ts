export interface GazeVector {
  x: number;
  y: number;
  drift: number;
  stability: number;
  confidence: number;
  valid: boolean;
}

export function computeGazeVector(
  fv: {
    x: number;
    y: number;
    valid: boolean;
    leftEyeOpen: number;
    rightEyeOpen: number;
  },
baseline: {
  x: number;
  y: number;
  centerX: number;
  centerY: number;
  horizontalThreshold: number;
  verticalThreshold: number;
  driftThreshold: number;
  stabilized?: boolean;
} | null

): GazeVector {

  if (!fv.valid) {
    return {
      x: 0,
      y: 0,
      drift: 0,
      stability: 0,
      confidence: 0,
      valid: false,
    };
  }

  const confidence = Math.max(
    0,
    Math.min(1, fv.leftEyeOpen + fv.rightEyeOpen)
  );

  if (!baseline) {
    return {
      x: fv.x,
      y: fv.y,
      drift: 0,
      stability: confidence,
      confidence,
      valid: true,
    };
  }

const dx = fv.x - baseline.x;
const dy = fv.y - baseline.y;

  const drift = Math.sqrt(dx * dx + dy * dy);

  const stability = Math.max(0, Math.min(1, confidence * (1 - drift)));

  return {
    x: fv.x,
    y: fv.y,
    drift,
    stability,
    confidence,
    valid: true,
  };
}
