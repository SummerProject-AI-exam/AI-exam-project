import React, { useState } from "react";
import { CalibrationViewer } from "../../landmarker/components/CalibrationViewer";

type Props = {
  sessionId: string;
  onContinue: () => void;
};

export default function CalibrationStep({ sessionId, onContinue }: Props) {
  const [startCalibrationFn, setStartCalibrationFn] = useState<(() => void) | null>(null);

  const handleStartCalibration = React.useCallback((fn: () => void) => {
    setStartCalibrationFn(() => fn);
  }, []);

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 720,
        margin: "0 auto",
        paddingTop: 40,
        paddingBottom: 60,
        textAlign: "center",
      }}
    >
      <h2 style={{ marginBottom: 12, fontSize: "1.8rem" }}>
        Step 1: Calibration
      </h2>

      <p style={{ marginBottom: 32, color: "#555", fontSize: "1rem" }}>
        Look at the dot in the center while the countdown runs.
        We’ll collect a few samples to measure your gaze baseline.
      </p>

      {/* Viewer */}
      <div style={{ marginBottom: 20, height: "60vh" }}>
        <CalibrationViewer
          sessionId={sessionId}
          onStartCalibration={handleStartCalibration}
        />
      </div>

      {/* Buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 16,
          marginTop: 10,
        }}
      >
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "10px 16px",
            background: "#e0e0e0",
            color: "#333",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            width: "140px",
          }}
        >
          Redo
        </button>

        <button
          onClick={() => startCalibrationFn?.()}
          style={{
            padding: "10px 16px",
            background: "#0078ff",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            width: "140px",
          }}
        >
          Calibrate
        </button>

        <button
          onClick={onContinue}
          style={{
            padding: "10px 16px",
            background: "#00a000",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            width: "140px",
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
