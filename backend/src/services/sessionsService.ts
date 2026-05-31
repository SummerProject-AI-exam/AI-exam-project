import { supabase } from '../db/supabaseClient'

interface CreateSessionInput {
  studentId: string
  examId: string
}

export const createSessionService = async ({ studentId, examId }: CreateSessionInput) => {
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('Exam_Sessions')
    .insert({
      exam_id: examId,
      student_id: studentId,
      started_at: now,
      ended_at: now,         
      status: 'active'       
    })
    .select()
    .single()

  if (error) {
    console.error('Supabase error creating session:', error)
    throw error
  }

  return data
}
