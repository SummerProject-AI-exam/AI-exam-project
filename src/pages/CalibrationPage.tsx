import { useSearchParams } from "react-router-dom";
import CalibrationStep from "../training/components/CalibrationStep";

export default function CalibrationPage() {
  const [params] = useSearchParams();
  const sessionId = params.get("sessionId") ?? "";

  return (
    <CalibrationStep
      sessionId={sessionId}
      onContinue={() => {}}
    />
  );
}
