import { useState, useEffect, useRef } from "react";
import { computePose } from "../utils/poseDetection";
import type { PoseResult } from "../utils/poseDetection";

export function usePose(landmarks: any) {
  const [pose, setPose] = useState<(PoseResult & { direction: string | null }) | null>(null);

  const poseTimers = useRef({
    left: null as number | null,
    right: null as number | null,
    up: null as number | null,
    down: null as number | null,
  });

  const stablePoseRef = useRef({
    tooLeft: false,
    tooRight: false,
    tooUp: false,
    tooDown: false,
  });

  const directionStartRef = useRef<number | null>(null);
  const lastDirectionRef = useRef<string | null>(null);
  const HOLD_DURATION = 3000;

  useEffect(() => {
    if (!landmarks) {
      setPose(null);
      directionStartRef.current = null;
      lastDirectionRef.current = null;
      return;
    }

    const raw = computePose(landmarks);
    if (!raw) {
      setPose(null);
      return;
    }

    const now = performance.now();

    function updateStableFlag(flag: "tooLeft" | "tooRight" | "tooUp" | "tooDown", active: boolean) {
      const timerKey = flag.replace("too", "").toLowerCase() as "left" | "right" | "up" | "down";

      if (active && !stablePoseRef.current[flag]) {
        if (!poseTimers.current[timerKey]) {
          poseTimers.current[timerKey] = window.setTimeout(() => {
            stablePoseRef.current[flag] = true;
            poseTimers.current[timerKey] = null;
          }, 200);
        }
      } else if (!active && stablePoseRef.current[flag]) {

        if (!poseTimers.current[timerKey]) {
          poseTimers.current[timerKey] = window.setTimeout(() => {
            stablePoseRef.current[flag] = false;
            poseTimers.current[timerKey] = null;
          }, 200);
        }
      } else {
        if (poseTimers.current[timerKey]) {
          clearTimeout(poseTimers.current[timerKey]!);
          poseTimers.current[timerKey] = null;
        }
      }
    }

    updateStableFlag("tooLeft", raw.tooLeft);
    updateStableFlag("tooRight", raw.tooRight);
    updateStableFlag("tooUp", raw.tooUp);
    updateStableFlag("tooDown", raw.tooDown);

  
    let direction: string | null = null;
    if (stablePoseRef.current.tooLeft) direction = "left";
    else if (stablePoseRef.current.tooRight) direction = "right";
    else if (stablePoseRef.current.tooUp) direction = "up";
    else if (stablePoseRef.current.tooDown) direction = "down";


    if (direction !== lastDirectionRef.current) {
      lastDirectionRef.current = direction;
      directionStartRef.current = direction ? now : null;
    }

    let stableDirection: string | null = null;
    if (direction && directionStartRef.current !== null) {
      const dt = now - directionStartRef.current;
      if (dt >= HOLD_DURATION) {
        stableDirection = direction;
      }
    }

    setPose({
      ...raw,
      ...stablePoseRef.current,
      direction: stableDirection,
    });

  }, [landmarks]);

  return pose;
}