import { useRawAlerts } from "./useRawAlerts";
import { useStableAlert } from "./useStableAlerts";
import type { AlertState, AlertType } from "./alertTypes";

interface AlertInput {
  faceCount: number;
  cameraReady: boolean;
  cameraBlocked: boolean;
  cameraOff: boolean;
  distanceStatus: "close" | "far" | "normal";
}

export function useAlerts(input: AlertInput): AlertState | null {
  
  const rawAlert: AlertType | null = useRawAlerts(input);


  const stableAlert = useStableAlert(rawAlert, 300);

  return stableAlert;
}