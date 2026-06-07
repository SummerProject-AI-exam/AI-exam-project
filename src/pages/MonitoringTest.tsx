import FaceLandmarkerViewer from "../landmarker/components/FaceLandmarkerViewer";

export default function MonitoringTest() {
  return (
    <div
      style={{ minHeight: "100vh", background: "#111", color: "#eee" }}
    >
      <h1 style={{ textAlign: "center", padding: "1rem" }}>
        FaceLandmarker Demo
      </h1>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <FaceLandmarkerViewer />
      </div>
    </div>
  );
}
