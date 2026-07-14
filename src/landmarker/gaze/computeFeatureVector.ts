
import type { LandmarkFeatures } from "./extractLandmarkFeatures";

export interface FeatureVector {
  x: number;
  y: number;
  valid: boolean;

  leftIrisX: number;
  rightIrisX: number;
  leftIrisY: number;
  rightIrisY: number;
  leftEyeOpen: number;
  rightEyeOpen: number;
}

export function computeFeatureVector(features: LandmarkFeatures): FeatureVector {
  const {
    leftEyeLeftCorner,
    leftEyeRightCorner,
    rightEyeLeftCorner,
    rightEyeRightCorner,
    leftIrisCenter,
    rightIrisCenter,
    leftUpperEyelid,
    leftLowerEyelid,
    rightUpperEyelid,
    rightLowerEyelid,
  } = features;

  // If ANY required landmark is missing → return neutral values
  if (
    !leftEyeLeftCorner ||
    !leftEyeRightCorner ||
    !rightEyeLeftCorner ||
    !rightEyeRightCorner ||
    !leftIrisCenter ||
    !rightIrisCenter ||
    !leftUpperEyelid ||
    !leftLowerEyelid ||
    !rightUpperEyelid ||
    !rightLowerEyelid
  ) {
    return {
      x: 0,
      y: 0,
      valid: false,
      leftIrisX: 0.5,
      rightIrisX: 0.5,
      leftIrisY: 0.5,
      rightIrisY: 0.5,
      leftEyeOpen: 0,
      rightEyeOpen: 0,
    };
  }

  const leftIrisX =
    (leftIrisCenter.x - leftEyeLeftCorner.x) /
    (leftEyeRightCorner.x - leftEyeLeftCorner.x);

  const rightIrisX =
    (rightIrisCenter.x - rightEyeLeftCorner.x) /
    (rightEyeRightCorner.x - rightEyeLeftCorner.x);

  const leftIrisY =
    (leftIrisCenter.y - leftUpperEyelid.y) /
    (leftLowerEyelid.y - leftUpperEyelid.y);

  const rightIrisY =
    (rightIrisCenter.y - rightUpperEyelid.y) /
    (rightLowerEyelid.y - rightUpperEyelid.y);

  const leftEyeOpen = leftLowerEyelid.y - leftUpperEyelid.y;
  const rightEyeOpen = rightLowerEyelid.y - rightUpperEyelid.y;

  // ⭐ NEW: map iris ratios → x/y for old pipeline
  const x = ((leftIrisX + rightIrisX) / 2 - 0.5) * 2; // -1 to +1
  const y = ((leftIrisY + rightIrisY) / 2 - 0.5) * 2; // -1 to +1

  return {
    x,
    y,
    valid: true,
    leftIrisX,
    rightIrisX,
    leftIrisY,
    rightIrisY,
    leftEyeOpen,
    rightEyeOpen,
  };
}