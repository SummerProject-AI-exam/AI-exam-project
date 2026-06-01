import { supabase } from "../utils/supabaseClient";

export async function getFraudEvents(sessionId: string) {
  const { data, error } = await supabase
    .from("Fraud_Events")
    .select("*")
    .eq("session_id", sessionId)
    .order("timestamp", { ascending: true });
    
  if (error) {
    console.error("Failed to fetch events:", error);
    return [];
  }

  return data;
}
