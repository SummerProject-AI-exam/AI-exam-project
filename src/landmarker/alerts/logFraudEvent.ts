import { supabase } from "../utils/supabaseClient";

export async function logFraudEvent({
  sessionId,
  eventType,
}: {
  sessionId: string;
  eventType: string;
}) {

  console.log("SUPABASE CLIENT:", supabase);
  console.log("LOGGING TO SUPABASE:", sessionId, eventType);

  const { error } = await supabase.from("Fraud_Events").insert({
    session_id: sessionId,
    event_type: eventType,
    timestamp: new Date().toISOString(),
  });

  console.log("SUPABASE INSERT RESULT:", error);

  if (error) {
    console.error("Failed to log fraud event:", error);
  }
}
