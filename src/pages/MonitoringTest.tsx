import FaceLandmarkerViewer from "../landmarker/components/FaceLandmarkerViewer";

export default function MonitoringTest() {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: 640,
        margin: "0 auto",
        padding: 20,
        textAlign: "center",
        background: "white",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <h1 style={{ marginBottom: 20 }}>Monitoring</h1>
      <h2 style={{ marginBottom: 20 }}>Camera Alerts</h2>

      <FaceLandmarkerViewer />
    </div>
  );
}
