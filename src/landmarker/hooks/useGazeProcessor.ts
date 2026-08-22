import { useRef } from "react";

export type Direction =
  | "CENTER"
  | "LEFT"
  | "RIGHT"
  | "UP"
  | "DOWN";

export interface RawGaze {
  x: number;
  y: number;
  valid: boolean;
}

export interface Baseline {
  x: number;
  y: number;
}

export interface ProcessedGaze {
  x: number;
  y: number;
  dx: number;
  dy: number;

  valid: boolean;

  stable: boolean;
  centered: boolean;
  fixation: boolean;

  drift: number;
  direction: Direction;

  reset: () => void;
}

const CENTER_X = 0.20;
const CENTER_Y = 0.18;

const STABILITY_WINDOW = 6;
const MAX_SPREAD = 0.25;
const MAX_VARIANCE = 0.05;

const SMOOTH_ALPHA = 0.7;

export function useGazeProcessor(
  raw: RawGaze,
  baseline: Baseline | null
): ProcessedGaze {
  const smooth = useRef({ x: 0, y: 0 });
  const stabilityBuffer = useRef<{ x: number; y: number }[]>([]);

  const reset = () => {
    smooth.current = { x: 0, y: 0 };
    stabilityBuffer.current = [];
  };

  if (!raw.valid) {
    stabilityBuffer.current = [];

    return {
      x: 0,
      y: 0,
      dx: 0,
      dy: 0,
      valid: false,
      stable: false,
      centered: false,
      fixation: false,
      drift: 0,
      direction: "CENTER",
      reset,
    };
  }

  const sx =
    SMOOTH_ALPHA * raw.x +
    (1 - SMOOTH_ALPHA) * smooth.current.x;

  const sy =
    SMOOTH_ALPHA * raw.y +
    (1 - SMOOTH_ALPHA) * smooth.current.y;

  smooth.current = { x: sx, y: sy };

  const x = Math.max(-1, Math.min(1, sx));
  const y = Math.max(-1, Math.min(1, sy));

  const dx = baseline ? x - baseline.x : x;
  const dy = baseline ? y - baseline.y : y;

  stabilityBuffer.current.push({ x: dx, y: dy });

  if (stabilityBuffer.current.length > STABILITY_WINDOW) {
    stabilityBuffer.current.shift();
  }

  const xs = stabilityBuffer.current.map(p => p.x);
  const ys = stabilityBuffer.current.map(p => p.y);

  const stable =
    stabilityBuffer.current.length >= 4 &&
    spread(xs) < MAX_SPREAD &&
    spread(ys) < MAX_SPREAD &&
    variance(xs) < MAX_VARIANCE &&
    variance(ys) < MAX_VARIANCE;

  const drift = Math.sqrt(dx * dx + dy * dy);

  const centered =
    Math.abs(dx) < CENTER_X &&
    Math.abs(dy) < CENTER_Y;

  const fixation = centered && stable;

  let direction: Direction = "CENTER";

  if (!centered) {
    if (Math.abs(dx) >= Math.abs(dy)) {
      direction = dx > 0 ? "RIGHT" : "LEFT";
    } else {
      direction = dy > 0 ? "DOWN" : "UP";
    }
  }

  return {
    x,
    y,
    dx,
    dy,
    valid: true,
    stable,
    centered,
    fixation,
    drift,
    direction,
    reset,
  };
}

function variance(values: number[]): number {
  if (values.length === 0) return 0;

  const mean =
    values.reduce((sum, v) => sum + v, 0) / values.length;

  return (
    values.reduce((sum, v) => sum + (v - mean) ** 2, 0) /
    values.length
  );
}

function spread(values: number[]): number {
  if (values.length === 0) return Infinity;

  return Math.max(...values) - Math.min(...values);
}
