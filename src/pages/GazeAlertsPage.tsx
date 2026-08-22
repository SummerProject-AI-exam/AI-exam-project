import { useSearchParams } from "react-router-dom";
import { GazeAlertViewer } from "../landmarker/components/GazeAlertViewer";

export default function GazeAlertsPage() {
  const [params] = useSearchParams();
  const sessionId = params.get("sessionId") ?? "";

  return (
    <div style={{ padding: 20 }}>
      <h1>Gaze Alerts Test</h1>
      <GazeAlertViewer sessionId={sessionId} />
    </div>
  );
}
