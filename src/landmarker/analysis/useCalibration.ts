export type CalibrationStatus = {
  calibrated: boolean;
  faceDetected: boolean;
  stable: boolean;
  progress: number;
};

export function analyzeCalibration(
  facePresence: { faceDetected: boolean; stable: boolean },
  requiredMs = 1500
): CalibrationStatus {
  // static refs stored inside the function scope
  // but isolated per caller instance
  if (!(analyzeCalibration as any)._state) {
    (analyzeCalibration as any)._state = {
      startTime: 0,
      done: false,
    };
  }

  const state = (analyzeCalibration as any)._state;

  const status: CalibrationStatus = {
    calibrated: false,
    faceDetected: facePresence.faceDetected,
    stable: facePresence.stable,
    progress: 0,
  };

  // --- RESET CONDITIONS ---
  if (!facePresence.faceDetected || !facePresence.stable) {
    state.startTime = 0;
    state.done = false;
    return status;
  }

  // --- START TIMER ---
  if (state.startTime === 0) {
    state.startTime = performance.now();
  }

  // --- PROGRESS ---
  const elapsed = performance.now() - state.startTime;
  status.progress = Math.min(elapsed / requiredMs, 1);

  // --- COMPLETE ---
  if (elapsed >= requiredMs) {
    state.done = true;
    status.calibrated = true;
    status.progress = 1;
  }

  return status;
}
