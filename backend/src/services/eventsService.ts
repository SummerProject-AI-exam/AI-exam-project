import { supabase } from '../db/supabaseClient'

interface LogEventInput {
  sessionId: string
  type?: string
  confidence?: number
  details?: any
}

export const logEventService = async ({ sessionId, type, confidence, details }: LogEventInput) => {
  const now = new Date().toISOString()

  const { error } = await supabase
    .from('Fraud_Events')
    .insert({
      session_id: sessionId,
      event_type: type || null,
      confidence: confidence || null,
      details: details || null,
      created_at: now,
      timestamp: now
    })

  if (error) {
    console.error('Supabase error logging fraud event:', error)
    throw error
  }
}
