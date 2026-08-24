import { CombinedViewer } from "../landmarker/components/ReadinessViewer";

export default function ReadinessTest() {
  console.log("ReadinessTest mounted");
  return (
    <div style={{ padding: 20 }}>
      <h1>Readiness Test</h1>
      <CombinedViewer mode="camera-check" onReady={() => console.log("Ready!")} />
    </div>
  );
}
