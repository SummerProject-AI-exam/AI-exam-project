import TrainingViewerFrame from "./TrainingViewerFrame";
import MonitoringViewer from "./MonitoringViewer";
import { GazeAlertViewer } from "../../landmarker/components/GazeAlertViewer";

export default function TrainingMonitoring({ sessionId }: { sessionId: string }) {

  return (
    <div style={{ textAlign: "center", width: "100%" }}>
      <h2>Monitoring</h2>
      <p>Move your head, look around, and observe how alerts behave.</p>

      <div style={{ width: 640, margin: "0 auto", position: "relative" }}>
        <TrainingViewerFrame>
          <MonitoringViewer sessionId={sessionId} />
        </TrainingViewerFrame>

      </div>
    </div>
  );
}
