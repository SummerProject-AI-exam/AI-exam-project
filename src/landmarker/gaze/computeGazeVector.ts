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
  baseline: { centerX: number; centerY: number } | null
): GazeVector {
  // Invalid feature vector → invalid gaze
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

  // Confidence from normalized eye openness
  const confidence = Math.max(
    0,
    Math.min(1, fv.leftEyeOpen + fv.rightEyeOpen)
  );

  // No baseline yet → no drift
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

  // Baseline-relative drift
  const dx = fv.x - baseline.centerX;
  const dy = fv.y - baseline.centerY;
  const drift = Math.sqrt(dx * dx + dy * dy);

  // Stability = confidence * (1 - drift)
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
