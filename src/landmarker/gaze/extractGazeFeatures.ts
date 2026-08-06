import type { FaceLandmarkerResult } from "@mediapipe/tasks-vision";

export interface GazeFeatures {
  gazeX: number;
  gazeY: number;

  leftEyeOpen: number;
  rightEyeOpen: number;

  valid: boolean;
}

function midpoint(a: any, b: any) {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  };
}

export function extractGazeFeatures(
  results: FaceLandmarkerResult
): GazeFeatures {
  if (!results.faceLandmarks || results.faceLandmarks.length === 0) {
    return {
      gazeX: 0,
      gazeY: 0,
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

  // Eye center (corner midpoint)
  const leftEyeCenter = midpoint(LEFT_EYE_LEFT, LEFT_EYE_RIGHT);
  const rightEyeCenter = midpoint(RIGHT_EYE_LEFT, RIGHT_EYE_RIGHT);

  // Eyelid midpoint
  const leftLidCenter = midpoint(LEFT_UPPER, LEFT_LOWER);
  const rightLidCenter = midpoint(RIGHT_UPPER, RIGHT_LOWER);

  // Eye openness
  const leftEyeOpen = Math.abs(LEFT_UPPER.y - LEFT_LOWER.y);
  const rightEyeOpen = Math.abs(RIGHT_UPPER.y - RIGHT_LOWER.y);

  // Current gaze estimate (identical to the existing implementation)
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
    leftEyeOpen,
    rightEyeOpen,
    valid: true,
  };
}