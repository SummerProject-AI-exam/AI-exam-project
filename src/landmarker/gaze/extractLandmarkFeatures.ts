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

  // Eye centers
  const leftEyeCenter = midpoint(lm[33], lm[133]);
  const rightEyeCenter = midpoint(lm[362], lm[263]);

  // Eye corners
  const leftEyeLeftCorner = lm[33] || null;
  const leftEyeRightCorner = lm[133] || null;

  const rightEyeLeftCorner = lm[362] || null;
  const rightEyeRightCorner = lm[263] || null;

  // Eyelids
  const leftUpperEyelid = lm[159] || null;
  const leftLowerEyelid = lm[145] || null;

  const rightUpperEyelid = lm[386] || null;
  const rightLowerEyelid = lm[374] || null;

  // Iris centers
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
  };
}
