import { useRawAlerts } from "./useRawAlerts";
import { useStableAlert } from "./useStableAlert";
import type { AlertState, AlertType } from "./alertTypes";

interface AlertInput {
  faceCount: number;
  cameraReady: boolean;
  cameraBlocked: boolean;
  cameraOff: boolean;
}

export function useAlerts(input: AlertInput): AlertState | null {
  // 1. Get the raw alert type (flickery)
  const rawAlert: AlertType | null = useRawAlerts(input);

  // 2. Stabilize it and add timestamp
  const stableAlert = useStableAlert(rawAlert, 300);

  return stableAlert;
}
