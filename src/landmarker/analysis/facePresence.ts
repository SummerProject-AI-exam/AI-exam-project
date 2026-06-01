
export type FacePresenceStatus = {
  faceDetected: boolean;
  stable: boolean;
  confidence: number;
};

let lastDetectionTime = 0;

export function analyzeFacePresence(
  faceLandmarks: any | null,
  minConfidence = 0.5,
  stabilityMs = 1200
): FacePresenceStatus {
  const status: FacePresenceStatus = {
    faceDetected: false,
    stable: false,
    confidence: 0,
  };

  
  if (!faceLandmarks || faceLandmarks.length === 0) {
    lastDetectionTime = 0;
    return status;
  }

  const confidence = faceLandmarks[0].score ?? 1;
  status.confidence = confidence;

  if (confidence < minConfidence) {
    lastDetectionTime = 0;
    return status;
  }

  
  status.faceDetected = true;

  if (lastDetectionTime === 0) {
    lastDetectionTime = performance.now();
  }

  
  const elapsed = performance.now() - lastDetectionTime;

  if (elapsed >= stabilityMs) {
    status.stable = true;
  }

  return status;
}
