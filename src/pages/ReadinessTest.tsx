import { CombinedViewer } from "../landmarker/components/ReadinessViewer";

export default function ReadinessTest() {
  console.log("ReadinessTest mounted");
  return (
    <div
      style={{
        padding: 20,
        textAlign: "center",
      }}
    >
      <h1 style={{ marginBottom: 20 }}>Camera Setup</h1>

      <CombinedViewer />
    </div>
  );
}
