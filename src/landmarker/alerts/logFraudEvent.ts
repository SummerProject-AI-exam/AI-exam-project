import { supabase } from "../utils/supabaseClient";

export async function logFraudEvent({
  sessionId,
  eventType
}: {
  sessionId: string;
  eventType: string;
}) {
  const now = new Date().toISOString();

  const payload = {
    session_id: sessionId,
    event_type: eventType,
    timestamp: now,
    created_at: now
  };

  console.log("FINAL PAYLOAD SENT TO SUPABASE:", payload);

  const { error } = await supabase
    .from("Fraud_Events")
    .insert(payload);

  console.log("SUPABASE INSERT RESULT:", error);

  if (error) {
    console.error("Failed to log fraud event:", error);
  }
}
