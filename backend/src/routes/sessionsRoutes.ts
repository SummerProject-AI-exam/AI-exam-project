import { Router } from 'express'
import { createSession } from '../controllers/sessionsController'

const router = Router()

router.post('/', createSession)

export default router
