import type { LandmarkFeatures } from "./extractLandmarkFeatures";

export interface GazeVector {
  x: number;
  y: number;
  valid: boolean;
}

export function computeGazeVector(features: LandmarkFeatures): GazeVector {
  const {
    leftEyeCenter,
    rightEyeCenter,
    leftIrisCenter,
    rightIrisCenter,
    leftEyeLeftCorner,
    leftEyeRightCorner,
    rightEyeLeftCorner,
    rightEyeRightCorner,
    leftUpperEyelid,
    leftLowerEyelid,
    rightUpperEyelid,
    rightLowerEyelid,
  } = features;

  if (
    !leftEyeCenter ||
    !rightEyeCenter ||
    !leftIrisCenter ||
    !rightIrisCenter ||
    !leftEyeLeftCorner ||
    !leftEyeRightCorner ||
    !rightEyeLeftCorner ||
    !rightEyeRightCorner ||
    !leftUpperEyelid ||
    !leftLowerEyelid ||
    !rightUpperEyelid ||
    !rightLowerEyelid
  ) {
    return { x: 0, y: 0, valid: false };
  }

  // Eye width (horizontal)
  const leftWidth = Math.abs(leftEyeRightCorner.x - leftEyeLeftCorner.x);
  const rightWidth = Math.abs(rightEyeRightCorner.x - rightEyeLeftCorner.x);

  // Eye height (vertical)
  const leftHeight = Math.abs(leftUpperEyelid.y - leftLowerEyelid.y);
  const rightHeight = Math.abs(rightUpperEyelid.y - rightLowerEyelid.y);

  const safeLeftWidth = leftWidth || 1;
  const safeRightWidth = rightWidth || 1;
  const safeLeftHeight = leftHeight || 1;
  const safeRightHeight = rightHeight || 1;

  // Normalized offsets
  const leftX = (leftIrisCenter.x - leftEyeCenter.x) / safeLeftWidth;
  const rightX = (rightIrisCenter.x - rightEyeCenter.x) / safeRightWidth;

  const leftY = (leftIrisCenter.y - leftEyeCenter.y) / safeLeftHeight;
  const rightY = (rightIrisCenter.y - rightEyeCenter.y) / safeRightHeight;

  // Average both eyes
  const gazeX = (leftX + rightX) / 2;
  const gazeY = (leftY + rightY) / 2;

  // Scale factors (universal)
  const SCALE_X = 20;
  const SCALE_Y = 3;

  return {
    x: gazeX * SCALE_X,
    y: gazeY * SCALE_Y,
    valid: true,
  };


  return { x: gazeX, y: gazeY, valid: true };
}
