import type { FaceLandmarkerResult } from "@mediapipe/tasks-vision";

export interface LandmarkFeatures {
  leftEyeCenter: { x: number; y: number } | null;
  rightEyeCenter: { x: number; y: number } | null;

  leftIrisCenter: { x: number; y: number } | null;
  rightIrisCenter: { x: number; y: number } | null;

  leftEyeLeftCorner: { x: number; y: number } | null;
  leftEyeRightCorner: { x: number; y: number } | null;
  rightEyeLeftCorner: { x: number; y: number } | null;
  rightEyeRightCorner: { x: number; y: number } | null;

  leftUpperEyelid: { x: number; y: number } | null;
  leftLowerEyelid: { x: number; y: number } | null;
  rightUpperEyelid: { x: number; y: number } | null;
  rightLowerEyelid: { x: number; y: number } | null;
}

function midpoint(a: any, b: any) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

export function extractLandmarkFeatures(
  results: FaceLandmarkerResult
): LandmarkFeatures {
  if (!results.faceLandmarks || results.faceLandmarks.length === 0) {
    return {
      leftEyeCenter: null,
      rightEyeCenter: null,
      leftIrisCenter: null,
      rightIrisCenter: null,
      leftEyeLeftCorner: null,
      leftEyeRightCorner: null,
      rightEyeLeftCorner: null,
      rightEyeRightCorner: null,
      leftUpperEyelid: null,
      leftLowerEyelid: null,
      rightUpperEyelid: null,
      rightLowerEyelid: null,
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

  // Iris landmarks
  const leftIris = lm.slice(468, 473);
  const rightIris = lm.slice(473, 478);

  const leftIrisCenter = leftIris.length
    ? leftIris.reduce(
        (acc, p) => ({
          x: acc.x + p.x / leftIris.length,
          y: acc.y + p.y / leftIris.length,
        }),
        { x: 0, y: 0 }
      )
    : null;

  const rightIrisCenter = rightIris.length
    ? rightIris.reduce(
        (acc, p) => ({
          x: acc.x + p.x / rightIris.length,
          y: acc.y + p.y / rightIris.length,
        }),
        { x: 0, y: 0 }
      )
    : null;

  return {
    leftEyeCenter: midpoint(LEFT_EYE_LEFT, LEFT_EYE_RIGHT),
    rightEyeCenter: midpoint(RIGHT_EYE_LEFT, RIGHT_EYE_RIGHT),

    leftIrisCenter,
    rightIrisCenter,

    leftEyeLeftCorner: LEFT_EYE_LEFT,
    leftEyeRightCorner: LEFT_EYE_RIGHT,
    rightEyeLeftCorner: RIGHT_EYE_LEFT,
    rightEyeRightCorner: RIGHT_EYE_RIGHT,

    leftUpperEyelid: LEFT_UPPER,
    leftLowerEyelid: LEFT_LOWER,
    rightUpperEyelid: RIGHT_UPPER,
    rightLowerEyelid: RIGHT_LOWER,
  };
}
