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
      <h1
        style={{
          marginBottom: "20px",
          fontFamily: "Inter, sans-serif",
          fontWeight: 600,
          color: "#222",
        }}
      >
        Readiness Test
      </h1>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <CombinedViewer
        />
      </div>
    </div>
  );
}
