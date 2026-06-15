export type PoseResult = {
  smoothYaw: number;
  smoothPitch: number;
  tooLeft: boolean;
  tooRight: boolean;
  tooDown: boolean;
  tooUp: boolean;
};

// -----------------------------
// Smoothing buffers
// -----------------------------
const yawHistory: number[] = [];
const pitchHistory: number[] = [];

// -----------------------------
// Main computePose function
// -----------------------------
export function computePose(landmarks: any): PoseResult | null {
  if (!landmarks) return null;

  const left = landmarks[33];
  const right = landmarks[263];
  const nose = landmarks[1];
  if (!left || !right || !nose) return null;

  const eyeMidX = (left.x + right.x) / 2;
  const eyeMidY = (left.y + right.y) / 2;

  const eyeDistance = Math.hypot(right.x - left.x, right.y - left.y);
  if (eyeDistance < 0.0001) return null;

  const yaw = (nose.x - eyeMidX) / eyeDistance;
  const pitch = (nose.y - eyeMidY) / eyeDistance;

  yawHistory.push(yaw);
  pitchHistory.push(pitch);

  if (yawHistory.length > 15) yawHistory.shift();
  if (pitchHistory.length > 15) pitchHistory.shift();

  const smoothYaw =
    yawHistory.reduce((a, b) => a + b, 0) / yawHistory.length;
  const smoothPitch =
    pitchHistory.reduce((a, b) => a + b, 0) / pitchHistory.length;

  // -----------------------------
  // FINAL THRESHOLDS (based on your real data)
  // -----------------------------
  // YAW (left/right)
  const tooLeft = smoothYaw < -0.25;
  const tooRight = smoothYaw > 0.25;

  // PITCH (up/down)
  // ENTER thresholds
  const enterDown = smoothPitch > 0.78; // you go to 0.82–0.84
  const enterUp = smoothPitch < 0.30;   // you go to 0.16–0.18

  // These booleans are *raw* — your usePose adds the 200ms hold
  const tooDown = enterDown;
  const tooUp = enterUp;

  return {
    smoothYaw,
    smoothPitch,
    tooLeft,
    tooRight,
    tooDown,
    tooUp,
  };
}
