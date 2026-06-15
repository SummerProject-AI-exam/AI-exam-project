
import { useRawAlerts } from "./useRawAlerts";
import { useStableAlert } from "./useStableAlerts";
import type { AlertState, AlertType } from "./alertTypes";

interface AlertInput {
  faceCount: number;
  cameraReady: boolean;
  cameraBlocked: boolean;
  cameraOff: boolean;
  poseTooLeft: boolean;
  poseTooRight: boolean;
  poseTooDown: boolean;
  poseTooUp: boolean;
}

export function useAlerts(input: AlertInput): AlertState | null {
  const rawAlert: AlertType | null = useRawAlerts(input);

  // 300ms stabilization for UI
  const stableAlert = useStableAlert(rawAlert, 300);

  return stableAlert;
}
