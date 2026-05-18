import FaceLandmarkerViewer from "./components/FaceLandmarkerViewer";

function App() {
  return (
    <div style={{ minHeight: "100vh", background: "#111", color: "#eee" }}>
      <h1 style={{ textAlign: "center", padding: "1rem" }}>
        FaceLandmarker Demo
      </h1>

      {/* Center the viewer */}
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

export default App;
