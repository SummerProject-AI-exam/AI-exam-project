import { useState } from "react";
import TrainingStart from "./components/TrainingStart";
import CalibrationStep from "./components/CalibrationStep";
import TrainingReadiness from "./components/TrainingReadinessCheck";
import TrainingMonitoring from "./components/TrainingMonitoring";

export default function TrainingRoom() {
  const [step, setStep] = useState(1);

  const params = new URLSearchParams(window.location.search);
  const urlSessionId = params.get("sessionId");
  const sessionId = urlSessionId ?? crypto.randomUUID();

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      {/* Step 1: Start */}
      {step === 1 && (
        <TrainingStart onContinue={() => setStep(2)} />
      )}

      {/* Step 2: Calibration */}
      {step === 2 && (
        <CalibrationStep
          sessionId={sessionId}
          onContinue={() => setStep(3)}
        />
      )}

      {/* Step 3: Readiness */}
      {step === 3 && (
  <TrainingReadiness onContinue={() => setStep(4)} />
)}

      {/* Step 4: Monitoring */}
      {step === 4 && (
        <TrainingMonitoring sessionId={sessionId} />
      )}
    </div>
  );
}
