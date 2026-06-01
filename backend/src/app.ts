import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import sessionsRoutes from './routes/sessionsRoutes'
import eventsRoutes from './routes/eventsRoutes'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/sessions', sessionsRoutes)
app.use('/api/events', eventsRoutes)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`)
})
