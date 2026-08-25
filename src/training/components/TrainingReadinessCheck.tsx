import TrainingViewerFrame from "./TrainingViewerFrame";
import { CombinedViewer } from "../../landmarker/components/ReadinessViewer";

type Props = {
  onContinue: () => void;
};

export default function TrainingReadines({ onContinue }: Props) {

  return (
    <div style={{ textAlign: "center", width: "100%" }}>
      <h2>Camera Readiness Check</h2>
      <p>The system checks camera conditions.</p>

      <div
        style={{
          width: "100%",
          maxWidth: "900px",
          margin: "0 auto",
          position: "relative",
        }}
      >

        <TrainingViewerFrame>
          <CombinedViewer />
        </TrainingViewerFrame>
      </div>

      <button
        onClick={onContinue}
        style={{
          marginTop: "20px",
          padding: "10px 16px",
          background: "#0078ff",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Continue
      </button>
    </div>
  );
}
