export type GazeValues = {
  ear: number | null
  eyesClosed: boolean
  eyesNotVisible: boolean
  gazeDirection: string
  irisConfidence: number
  rawIrisPosition: { x: number; y: number } | null
}
