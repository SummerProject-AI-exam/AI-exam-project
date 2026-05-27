export function getDistanceStatus(landmarks: any[] | null) {
  if (!landmarks || !landmarks[1]) return "normal";

  const z = landmarks[1].z;

  if (z > -0.15) return "close";
  if (z < -0.35) return "far";
  return "normal";
}