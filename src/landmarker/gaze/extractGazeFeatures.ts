import type { FaceLandmarkerResult } from "@mediapipe/tasks-vision";

export interface GazeFeatures {
  gazeX: number;        
  gazeY: number;        
  leftEyeOpen: number;
  rightEyeOpen: number;
  eyeOpenness: number;
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
      eyeOpenness: 0,
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

  // Iris centers (diagnostic only)
  const LEFT_IRIS = lm[468];
  const RIGHT_IRIS = lm[473];

  // Eye centers
  const leftEyeCenter = midpoint(LEFT_EYE_LEFT, LEFT_EYE_RIGHT);
  const rightEyeCenter = midpoint(RIGHT_EYE_LEFT, RIGHT_EYE_RIGHT);

  // Eye openness
  const leftEyeWidth = Math.hypot(
    LEFT_EYE_RIGHT.x - LEFT_EYE_LEFT.x,
    LEFT_EYE_RIGHT.y - LEFT_EYE_LEFT.y
  );

  const rightEyeWidth = Math.hypot(
    RIGHT_EYE_RIGHT.x - RIGHT_EYE_LEFT.x,
    RIGHT_EYE_RIGHT.y - RIGHT_EYE_LEFT.y
  );

  const leftEyeOpen =
    leftEyeWidth > 0
      ? Math.abs(LEFT_UPPER.y - LEFT_LOWER.y) / leftEyeWidth
      : 0;

  const rightEyeOpen =
    rightEyeWidth > 0
      ? Math.abs(RIGHT_UPPER.y - RIGHT_LOWER.y) / rightEyeWidth
      : 0;

  const eyeOpenness = (leftEyeOpen + rightEyeOpen) / 2;

  const rawX =
    ((LEFT_IRIS.x - leftEyeCenter.x) +
      (RIGHT_IRIS.x - rightEyeCenter.x)) / 2;

  const rawY =
    ((LEFT_IRIS.y - leftEyeCenter.y) +
      (RIGHT_IRIS.y - rightEyeCenter.y)) / 2;

  const gazeX = rawX;
  const gazeY = rawY;

  return {
    gazeX,
    gazeY,
    leftEyeOpen,
    rightEyeOpen,
    eyeOpenness,
    valid: true,
  };
}
