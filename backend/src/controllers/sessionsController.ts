import { Request, Response } from 'express'
import { createSessionService } from '../services/sessionsService'

export const createSession = async (req: Request, res: Response) => {
  try {
    const { studentId, examId } = req.body

    const session = await createSessionService({ studentId, examId })

    res.status(201).json(session)
  } catch (error) {
    console.error('Error creating session:', error)
    res.status(500).json({ error: 'Failed to create session' })
  }
}
