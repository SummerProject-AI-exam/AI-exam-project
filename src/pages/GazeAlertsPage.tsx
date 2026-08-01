import { useSearchParams } from "react-router-dom";
import { GazeAlertsViewer } from "../landmarker/components/GazeAlertsViewer";

export default function GazeAlertsPage() {
  const [params] = useSearchParams();
  const sessionId = params.get("sessionId") ?? "";

  return (
    <div style={{ padding: 20 }}>
      <h1>Gaze Alerts Test</h1>
      <GazeAlertsViewer sessionId={sessionId} />
    </div>
  );
}
