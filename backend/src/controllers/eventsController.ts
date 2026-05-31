import { Request, Response } from 'express'
import { logEventService } from '../services/eventsService'

export const logEvent = async (req: Request, res: Response) => {
  try {
    const { sessionId, type, details } = req.body

    await logEventService({ sessionId, type, details })

    res.status(201).json({ success: true })
  } catch (error) {
    console.error('Error logging event:', error)
    res.status(500).json({ error: 'Failed to log event' })
  }
}
