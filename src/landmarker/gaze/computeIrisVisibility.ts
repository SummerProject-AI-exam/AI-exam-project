const LEFT_IRIS = [468, 469, 470, 471]

export function computeIrisVisibility(faceLandmarks: any[]) {
  if (!faceLandmarks || faceLandmarks.length === 0) {
    return {
      irisConfidence: 0,
      eyesNotVisible: true,
      rawIrisPosition: null,
    }
  }

  const irisPoints = LEFT_IRIS.map(i => faceLandmarks[i]).filter(Boolean)

  if (irisPoints.length < 4) {
    return {
      irisConfidence: 0,
      eyesNotVisible: true,
      rawIrisPosition: null,
    }
  }

  const rawIrisPosition = {
    x: irisPoints.reduce((sum: number, p: any) => sum + p.x, 0) / irisPoints.length,
    y: irisPoints.reduce((sum: number, p: any) => sum + p.y, 0) / irisPoints.length,
  }

  const irisConfidence = irisPoints.length / 4
  const eyesNotVisible = irisConfidence < 0.75

  return {
    irisConfidence,
    eyesNotVisible,
    rawIrisPosition,
  }
}
