export const saveFraudEvent = async (
  sessionId: string,
  type: string,
  confidence: number,
  details: any
) => {
  try {
    const response = await fetch(
      'http://localhost:3001/api/events',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId,
          type,
          confidence,
          details
        })
      }
    )

    if (!response.ok) {
      throw new Error('Failed to save event')
    }
  } catch (error) {
    console.error(error)
  }
}