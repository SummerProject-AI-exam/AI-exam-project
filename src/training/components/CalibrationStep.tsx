import React from "react";
import { CalibrationViewer } from "../../landmarker/components/CalibrationViewer";

type Props = {
  sessionId: string;
  onContinue: () => void;
};

export default function CalibrationStep({ sessionId }: Props) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: 32,
        boxSizing: "border-box",
        background: "#f5f5f5",
        paddingTop: "40px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 900,
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
          padding: 24,
          boxSizing: "border-box",
        }}
      >
        <h2
          style={{
            marginBottom: 12,
            fontSize: "1.8rem",
            textAlign: "center",
          }}
        >
          Gaze Calibration
        </h2>

        <p
          style={{
            marginBottom: 24,
            color: "#555",
            fontSize: "1rem",
            textAlign: "center",
          }}
        >
          Look at the dot in the center while the countdown runs.
          We’ll collect a few samples to measure your gaze baseline.
        </p>

        <div style={{ marginBottom: 24 }}>
          <CalibrationViewer sessionId={sessionId} />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: 8,
          }}
        >
          <button
            onClick={() => {
              const btn = document.querySelector(
                'button[style*="z-index: 9999"]'
              ) as HTMLButtonElement | null;
              btn?.click();
            }}
            style={{
              padding: "14px 26px",
              background: "#0078ff",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              minWidth: 180,
              fontSize: "1.1rem",
              fontWeight: 600,
            }}
          >
            Calibrate
          </button>
        </div>
      </div>
    </div>
  );
}
