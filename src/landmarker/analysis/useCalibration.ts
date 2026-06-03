
export type CalibrationStatus = {
  calibrated: boolean;
  faceDetected: boolean;
  stable: boolean;
  progress: number; 
};

let calibrationStartTime = 0;
let calibrationDone = false;

export function analyzeCalibration(
  facePresence: { faceDetected: boolean; stable: boolean },
  requiredMs = 1500
): CalibrationStatus {
  const status: CalibrationStatus = {
    calibrated: false,
    faceDetected: facePresence.faceDetected,
    stable: facePresence.stable,
    progress: 0,
  };

  
  if (!facePresence.faceDetected) {
    calibrationStartTime = 0;
    calibrationDone = false;
    return status;
  }

  
  if (!facePresence.stable) {
    calibrationStartTime = 0;
    calibrationDone = false;
    return status;
  }

  
  if (calibrationStartTime === 0) {
    calibrationStartTime = performance.now();
  }

  const elapsed = performance.now() - calibrationStartTime;
  status.progress = Math.min(elapsed / requiredMs, 1);

  if (elapsed >= requiredMs) {
    calibrationDone = true;
    status.calibrated = true;
    status.progress = 1;
  }

  return status;
}
