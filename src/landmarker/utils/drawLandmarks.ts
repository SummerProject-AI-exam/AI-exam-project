export function drawLandmarks(
  ctx: CanvasRenderingContext2D,
  points: { x: number; y: number }[],
  width: number,
  height: number
) {
  ctx.fillStyle = "cyan";
 // draw the landmarks as points
  for (const p of points) {
    ctx.beginPath();
    ctx.arc(p.x * width, p.y * height, 2, 0, 2 * Math.PI);
    ctx.fill();
  }
}
