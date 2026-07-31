import type { FaceLandmarkerResult } from "@mediapipe/tasks-vision";

export interface LandmarkFeatures {
  gazeX: number;
  gazeY: number;

  leftEyeCenter: { x: number; y: number } | null;
  rightEyeCenter: { x: number; y: number } | null;

  leftEyeLeftCorner: { x: number; y: number } | null;
  leftEyeRightCorner: { x: number; y: number } | null;
  rightEyeLeftCorner: { x: number; y: number } | null;
  rightEyeRightCorner: { x: number; y: number } | null;

  leftUpperEyelid: { x: number; y: number } | null;
  leftLowerEyelid: { x: number; y: number } | null;
  rightUpperEyelid: { x: number; y: number } | null;
  rightLowerEyelid: { x: number; y: number } | null;

  leftEyeOpen: number;
  rightEyeOpen: number;

  valid: boolean;
}

function midpoint(a: any, b: any) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

export function extractLandmarkFeatures(
  results: FaceLandmarkerResult
): LandmarkFeatures {
  if (!results.faceLandmarks || results.faceLandmarks.length === 0) {
    return {
      gazeX: 0,
      gazeY: 0,
      leftEyeCenter: null,
      rightEyeCenter: null,
      leftEyeLeftCorner: null,
      leftEyeRightCorner: null,
      rightEyeLeftCorner: null,
      rightEyeRightCorner: null,
      leftUpperEyelid: null,
      leftLowerEyelid: null,
      rightUpperEyelid: null,
      rightLowerEyelid: null,
      leftEyeOpen: 0,
      rightEyeOpen: 0,
      valid: false,
    };
  }

  const lm = results.faceLandmarks[0];

  // Eye corners
  const LEFT_EYE_LEFT = lm[33];
  const LEFT_EYE_RIGHT = lm[133];
  const RIGHT_EYE_LEFT = lm[362];
  const RIGHT_EYE_RIGHT = lm[263];

  // Eyelids
  const LEFT_UPPER = lm[159];
  const LEFT_LOWER = lm[145];
  const RIGHT_UPPER = lm[386];
  const RIGHT_LOWER = lm[374];

  // Eye centers (corner midpoint)
  const leftEyeCenter = midpoint(LEFT_EYE_LEFT, LEFT_EYE_RIGHT);
  const rightEyeCenter = midpoint(RIGHT_EYE_LEFT, RIGHT_EYE_RIGHT);

  // Eye openness
  const leftEyeOpen = Math.abs(LEFT_UPPER.y - LEFT_LOWER.y);
  const rightEyeOpen = Math.abs(RIGHT_UPPER.y - RIGHT_LOWER.y);

  // ---------- GAZE DIRECTION ----------
  // Horizontal gaze: compare eye center to eyelid midpoint
  const leftLidCenter = midpoint(LEFT_UPPER, LEFT_LOWER);
  const rightLidCenter = midpoint(RIGHT_UPPER, RIGHT_LOWER);

  // Gaze vector = difference between eye center and lid center
  const gazeX =
    ((leftEyeCenter.x - leftLidCenter.x) +
      (rightEyeCenter.x - rightLidCenter.x)) /
    2;

  const gazeY =
    ((leftEyeCenter.y - leftLidCenter.y) +
      (rightEyeCenter.y - rightLidCenter.y)) /
    2;

  return {
    gazeX,
    gazeY,

    leftEyeCenter,
    rightEyeCenter,

    leftEyeLeftCorner: LEFT_EYE_LEFT,
    leftEyeRightCorner: LEFT_EYE_RIGHT,
    rightEyeLeftCorner: RIGHT_EYE_LEFT,
    rightEyeRightCorner: RIGHT_EYE_RIGHT,

    leftUpperEyelid: LEFT_UPPER,
    leftLowerEyelid: LEFT_LOWER,
    rightUpperEyelid: RIGHT_UPPER,
    rightLowerEyelid: RIGHT_LOWER,

    leftEyeOpen,
    rightEyeOpen,

    valid: true,
  };
}
