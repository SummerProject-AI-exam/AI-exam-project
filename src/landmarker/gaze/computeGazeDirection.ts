const LEFT_EYE_BOX = {
  leftCorner: 33,
  rightCorner: 133,
  top: 159,
  bottom: 145,
}

export function computeGazeDirection(
  faceLandmarks: any[],
  rawIrisPosition: { x: number; y: number } | null
): 'LEFT' | 'RIGHT' | 'UP' | 'DOWN' | 'CENTER' {
  if (!faceLandmarks || !rawIrisPosition) return 'CENTER'

  const leftCorner = faceLandmarks[LEFT_EYE_BOX.leftCorner]
  const rightCorner = faceLandmarks[LEFT_EYE_BOX.rightCorner]
  const top = faceLandmarks[LEFT_EYE_BOX.top]
  const bottom = faceLandmarks[LEFT_EYE_BOX.bottom]

  if (!leftCorner || !rightCorner || !top || !bottom) return 'CENTER'

  const normX =
    (rawIrisPosition.x - leftCorner.x) /
    (rightCorner.x - leftCorner.x)

  const normY =
    (rawIrisPosition.y - top.y) /
    (bottom.y - top.y)

  if (normX < 0.35) return 'LEFT'
  if (normX > 0.65) return 'RIGHT'
  if (normY < 0.35) return 'UP'
  if (normY > 0.65) return 'DOWN'

  return 'CENTER'
}
