import { Router } from 'express'
import { logEvent } from '../controllers/eventsController'

const router = Router()

router.post('/', logEvent)

export default router
