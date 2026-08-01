const LEFT_EYE = {
  leftCorner: 33,
  rightCorner: 133,
  upper1: 160,
  upper2: 158,
  lower1: 153,
  lower2: 144,
}

export function computeEAR(faceLandmarks: any[]): number | null {
  if (!faceLandmarks || faceLandmarks.length === 0) return null

  const lc = faceLandmarks[LEFT_EYE.leftCorner]
  const rc = faceLandmarks[LEFT_EYE.rightCorner]
  const u1 = faceLandmarks[LEFT_EYE.upper1]
  const u2 = faceLandmarks[LEFT_EYE.upper2]
  const l1 = faceLandmarks[LEFT_EYE.lower1]
  const l2 = faceLandmarks[LEFT_EYE.lower2]

  if (!lc || !rc || !u1 || !u2 || !l1 || !l2) return null

  const vertical1 = distance(u1, l1)
  const vertical2 = distance(u2, l2)
  const horizontal = distance(lc, rc)

  return (vertical1 + vertical2) / (2 * horizontal)
}

function distance(a: any, b: any) {
  return Math.sqrt(
    (a.x - b.x) ** 2 +
    (a.y - b.y) ** 2 +
    (a.z - b.z) ** 2
  )
}
