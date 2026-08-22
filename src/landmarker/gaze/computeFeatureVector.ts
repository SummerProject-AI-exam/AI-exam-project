import type { GazeFeatures } from "./extractGazeFeatures";

export interface FeatureVector {
  x: number;
  y: number;
  valid: boolean;
  leftEyeOpen: number;
  rightEyeOpen: number;
}

export function computeFeatureVector(
  features: GazeFeatures
): FeatureVector {
  if (!features.valid) {
    return {
      x: 0,
      y: 0,
      valid: false,
      leftEyeOpen: 0,
      rightEyeOpen: 0,
    };
  }

  const { gazeX, gazeY, leftEyeOpen, rightEyeOpen } = features;

  const SCALE = 50;

  const x = Math.max(-1, Math.min(1, gazeX * SCALE));
  const y = Math.max(-1, Math.min(1, gazeY * SCALE));

  return {
    x,
    y,
    valid: true,
    leftEyeOpen,
    rightEyeOpen,
  };
}
