import FaceLandmarkerViewer from "../landmarker/components/FaceLandmarkerViewer";

export default function MonitoringTest() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "white",
        color: "#000",
        paddingTop: "20px",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
        Camera Alerts
      </h1>
      <div style={{ width: "100%", maxWidth: "900px", margin: "0 auto" }}>
        <FaceLandmarkerViewer />
      </div>
    </div>
  );
}
