import TrainingViewerFrame from "./TrainingViewerFrame";
import { CombinedViewer } from "../../landmarker/components/ReadinessViewer";

export default function TrainingStart({ onContinue }: { onContinue: () => void }) {
  return (
    <>
      <h2>Training Room</h2>
      <p>Make sure your face is visible and centered.</p>

      <TrainingViewerFrame>
        <CombinedViewer mode="camera-check" onReady={() => {}} />
      </TrainingViewerFrame>

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
    </>
  );
}
