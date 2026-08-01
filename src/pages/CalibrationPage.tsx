import { useSearchParams } from "react-router-dom";
import { CalibrationViewer } from "../landmarker/components/CalibrationViewer";

export default function CalibrationPage() {
  const [params] = useSearchParams();
  const sessionId = params.get("sessionId") ?? "";

  return (
    <div style={{ padding: 20 }}>
      <h1>Calibration</h1>
      <CalibrationViewer sessionId={sessionId} />
    </div>
  );
}
