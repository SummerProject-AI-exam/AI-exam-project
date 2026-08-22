import { useEffect, useRef, useState } from "react";
import type { GazeAlertType } from "../gazeAlerts/alertTypesGaze";
import { logFraudEvent } from "../alerts/logFraudEvent";
import type { FaceLandmarkerResult } from "@mediapipe/tasks-vision";

type GazeDirection =
  | "CENTER"
  | "LEFT"
  | "RIGHT"
  | "UP"
  | "DOWN"
  | "NONE";

type GazeFrame = {
  valid: boolean;
  fixation: boolean;
  stable: boolean;
  centered: boolean;
  eyesOpen: boolean;
  eyesCovered?: boolean;

  direction: GazeDirection;
  drift: number;
  confidence: number;
  vectorMagnitude: number;
  eyeOpenness: number;
  x: number;
  y: number;
};

type GazeBaseline = {
  x: number;
  y: number;
  centerX: number;
  centerY: number;
  horizontalThreshold: number;
  verticalThreshold: number;
  driftThreshold: number;
};

const ALERT_TIME = 1500;
const DIRECTION_CONFIRM_TIME = 300;
const PERSISTENCE_MULTIPLIER = 1.35;
const UP_PERSISTENCE_MULTIPLIER = 1.0;

const HORIZONTAL_CONFIRM_MULTIPLIER = 1.5;

const ALERT_DIRECTIONS: Array<
  "LEFT" | "RIGHT" | "UP"
> = ["LEFT", "RIGHT", "UP"];

function isAlertDirection(
  direction: GazeDirection
): direction is "LEFT" | "RIGHT" | "UP" {
  return (
    direction === "LEFT" ||
    direction === "RIGHT" ||
    direction === "UP"
  );
}

export function useGazeAlerts(
  state: string,
  baseline: GazeBaseline | null,
  gazeFrame: GazeFrame,
  startExam: boolean,
  results: FaceLandmarkerResult | null,
  sessionId: string | null,
  dynamicRate: number = 150
): {
  alert: GazeAlertType | null;
  warmupCountdown: number | null;
} {
  const gazeFrameRef = useRef(gazeFrame);
  const baselineRef = useRef(baseline);

  const [alert, setAlert] =
    useState<GazeAlertType | null>(null);

  // warm-up
  const [warmupDone, setWarmupDone] =
    useState(false);

  const [warmupCountdown, setWarmupCountdown] =
    useState<number | null>(null);

  // alert engine
  const activeDirection =
    useRef<GazeDirection>("CENTER");

  const candidateDirection =
    useRef<GazeDirection>("CENTER");

  const candidateStartedAt =
    useRef<number | null>(null);

  const persistenceStartedAt =
    useRef<number | null>(null);

  const excursionAlerted =
    useRef(false);

  // logging
  const lastLoggedDirection =
    useRef<GazeDirection>("CENTER");

  const lastLoggedTrackingState =
    useRef<"GOOD" | "BAD">("GOOD");

  
  useEffect(() => {
    gazeFrameRef.current = gazeFrame;
  }, [gazeFrame]);

  useEffect(() => {
    baselineRef.current = baseline;
  }, [baseline]);

  // start warm-up and warm-up timer
  useEffect(() => {
    if (!startExam) {
      setWarmupDone(false);
      setWarmupCountdown(null);
      return;
    }

    if (warmupDone) return;
    if (warmupCountdown !== null) return;

    setWarmupCountdown(3);
  }, [
    startExam,
    warmupDone,
    warmupCountdown,
  ]);

  useEffect(() => {
    if (warmupCountdown === null) return;

    if (warmupCountdown === 0) {
      console.log(
        "%c[GAZE] ALERT ENGINE READY",
        "color:#00C853;font-weight:bold;"
      );

      setWarmupDone(true);
      setWarmupCountdown(null);
      return;
    }

    const timer = window.setTimeout(() => {
      setWarmupCountdown(
        warmupCountdown - 1
      );
    }, 1000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [warmupCountdown]);

  // reset
  useEffect(() => {
    if (startExam) return;

    activeDirection.current =
      "CENTER";

    candidateDirection.current =
      "CENTER";

    candidateStartedAt.current =
      null;

    persistenceStartedAt.current =
      null;

    excursionAlerted.current =
      false;

    lastLoggedDirection.current =
      "CENTER";

    lastLoggedTrackingState.current =
      "GOOD";

    setAlert(null);
  }, [startExam]);

  // MAIN ALERT ENGINE
  useEffect(() => {
    if (state !== "MONITORING") return;
    if (!baseline) return;
    if (!startExam) return;
    if (!warmupDone) return;

    console.log(
      "%c[GAZE] ENGINE STARTED",
      "color:#2196F3;font-weight:bold;",
      {
        baselineX: baseline.x.toFixed(3),
        baselineY: baseline.y.toFixed(3),

        thresholdX:
          baseline.horizontalThreshold.toFixed(3),

        thresholdY:
          baseline.verticalThreshold.toFixed(3),
      }
    );

    const interval = window.setInterval(() => {
      const frame = gazeFrameRef.current;
      const currentBaseline =
        baselineRef.current;

      if (!currentBaseline) return;

      const now = performance.now();

  // tracking qaulity
      const trackingGood =
        frame.valid &&
        frame.confidence >= 0.7;

      if (!trackingGood) {
        activeDirection.current =
          "CENTER";

        candidateDirection.current =
          "CENTER";

        candidateStartedAt.current =
          null;

        persistenceStartedAt.current =
          null;

        excursionAlerted.current =
          false;

        if (
          lastLoggedTrackingState.current !==
          "BAD"
        ) {
          console.log(
            "[GAZE] TRACKING LOST",
            {
              valid: frame.valid,
              confidence:
                frame.confidence.toFixed(3),
            }
          );

          lastLoggedTrackingState.current =
            "BAD";
        }

        return;
      }

      if (
        lastLoggedTrackingState.current ===
        "BAD"
      ) {
        console.log(
          "[GAZE] TRACKING RECOVERED",
          {
            confidence:
              frame.confidence.toFixed(3),
          }
        );

        lastLoggedTrackingState.current =
          "GOOD";
      }

      // eyes covered
      if (frame.eyesCovered === true) {
        if (
          !excursionAlerted.current
        ) {
          excursionAlerted.current =
            true;

          const nextAlert =
            "EYES_COVERED" as GazeAlertType;

          console.log(
            "%c[GAZE ALERT] EYES COVERED",
            "color:#FF1744;font-weight:bold;",
            {
              alert: nextAlert,
            }
          );

          setAlert(nextAlert);

          if (!sessionId) {
            console.error(
              "[GAZE ALERT] No sessionId",
              nextAlert
            );
          } else {
            void logFraudEvent({
              sessionId,
              eventType: nextAlert,
            });
          }
        }

        return;
      }

    // calibrated position
      const dx =
        frame.x -
        currentBaseline.x;

      const dy =
        frame.y -
        currentBaseline.y;

      const absDx =
        Math.abs(dx);

      const absDy =
        Math.abs(dy);

      const horizontalThreshold =
        currentBaseline.horizontalThreshold;

      const verticalThreshold =
        currentBaseline.verticalThreshold;

     const horizontalDirectionThreshold =
  horizontalThreshold *
  PERSISTENCE_MULTIPLIER;

const verticalDirectionThreshold =
  verticalThreshold *
  UP_PERSISTENCE_MULTIPLIER;

  // raw direction
  const horizontalOutside =
  absDx >=
  horizontalDirectionThreshold;

const verticalOutside =
  absDy >=
  verticalDirectionThreshold;

      let rawDirection: GazeDirection =
        "CENTER";

      if (
        horizontalOutside &&
        verticalOutside
      ) {
        if (absDy > absDx) {
          rawDirection =
            dy > 0
              ? "DOWN"
              : "UP";
        } else {
          rawDirection =
            dx > 0
              ? "LEFT"
              : "RIGHT";
        }
      } else if (horizontalOutside) {
        rawDirection =
          dx > 0
            ? "LEFT"
            : "RIGHT";
      } else if (verticalOutside) {
        rawDirection =
          dy > 0
            ? "DOWN"
            : "UP";
      }

      // confirm direction
      const previousDirection =
        activeDirection.current;

      // center
      if (
        rawDirection ===
        "CENTER"
      ) {
        candidateDirection.current =
          "CENTER";

        candidateStartedAt.current =
          null;

        persistenceStartedAt.current =
          null;

        excursionAlerted.current =
          false;

        if (
          previousDirection !==
          "CENTER"
        ) {
          console.log(
            "[GAZE] CENTER",
            {
              from:
                previousDirection,

              dx:
                dx.toFixed(3),

              dy:
                dy.toFixed(3),
            }
          );

          console.log(
            "[GAZE] CENTER — RE-ARMED"
          );
        }

        activeDirection.current =
          "CENTER";

        return;
      }

      if (
        previousDirection !==
        "CENTER" &&
        rawDirection !==
        previousDirection
      ) {

        if (
          candidateDirection.current !==
          rawDirection
        ) {
          candidateDirection.current =
            rawDirection;

          candidateStartedAt.current =
            now;

          console.log(
            "[GAZE] DIRECTION CANDIDATE",
            {
              from:
                previousDirection,

              candidate:
                rawDirection,

              dx:
                dx.toFixed(3),

              dy:
                dy.toFixed(3),
            }
          );
        }

        persistenceStartedAt.current =
          null;

        excursionAlerted.current =
          false;

        const candidateDuration =
          candidateStartedAt.current ===
            null
            ? 0
            : now -
            candidateStartedAt.current;

        if (
          candidateDuration >=
          DIRECTION_CONFIRM_TIME
        ) {
          activeDirection.current =
            rawDirection;

          candidateDirection.current =
            rawDirection;

          candidateStartedAt.current =
            null;

          persistenceStartedAt.current =
            now;

          excursionAlerted.current =
            false;

          console.log(
            "%c[GAZE] DIRECTION CONFIRMED",
            "color:#FF9800;font-weight:bold;",
            {
              from:
                previousDirection,

              to:
                rawDirection,

              dx:
                dx.toFixed(3),

              dy:
                dy.toFixed(3),

              thresholdX:
                horizontalThreshold.toFixed(3),

              thresholdY:
                verticalThreshold.toFixed(3),

              confidence:
                frame.confidence.toFixed(3),

              requiredMs:
                DIRECTION_CONFIRM_TIME,
            }
          );
        }

        return;
      }

      // new direction from center
      if (
        previousDirection ===
        "CENTER"
      ) {
        if (
          candidateDirection.current !==
          rawDirection
        ) {
          candidateDirection.current =
            rawDirection;

          candidateStartedAt.current =
            now;

          console.log(
            "[GAZE] DIRECTION CANDIDATE",
            {
              from:
                "CENTER",

              candidate:
                rawDirection,

              dx:
                dx.toFixed(3),

              dy:
                dy.toFixed(3),

              horizontalConfirmThreshold:
                horizontalThreshold,
            }
          );
        }

        const candidateDuration =
          candidateStartedAt.current ===
            null
            ? 0
            : now -
            candidateStartedAt.current;

        if (
          candidateDuration >=
          DIRECTION_CONFIRM_TIME
        ) {
          activeDirection.current =
            rawDirection;

          candidateDirection.current =
            rawDirection;

          candidateStartedAt.current =
            null;

          persistenceStartedAt.current =
            now;

          excursionAlerted.current =
            false;

          console.log(
            "%c[GAZE] DIRECTION CONFIRMED",
            "color:#FF9800;font-weight:bold;",
            {
              from:
                "CENTER",

              to:
                rawDirection,

              dx:
                dx.toFixed(3),

              dy:
                dy.toFixed(3),

              thresholdX:
                horizontalThreshold.toFixed(3),

              thresholdY:
                verticalThreshold.toFixed(3),

              confidence:
                frame.confidence.toFixed(3),

              requiredMs:
                DIRECTION_CONFIRM_TIME,
            }
          );
        }

        return;
      }

      // same direction, still active
      const direction =
        activeDirection.current;

      if (
        rawDirection !==
        direction
      ) {

        persistenceStartedAt.current =
          null;

        return;
      }

      candidateDirection.current =
        direction;

      candidateStartedAt.current =
        null;

      // direction logging
      if (
        direction !==
        lastLoggedDirection.current
      ) {
        console.log(
          "[GAZE] DIRECTION",
          {
            from:
              lastLoggedDirection.current,

            to:
              direction,

            dx:
              dx.toFixed(3),

            dy:
              dy.toFixed(3),

            thresholdX:
              horizontalThreshold.toFixed(3),

            thresholdY:
              verticalThreshold.toFixed(3),
          }
        );

        lastLoggedDirection.current =
          direction;
      }

      // no down logging as alert
      if (
        direction ===
        "DOWN"
      ) {

        persistenceStartedAt.current =
          null;

        return;
      }

      // up, left and right only as fraud direction
      if (
        !isAlertDirection(direction)
      ) {
        return;
      }

      // persitance thresholds
      const persistenceHorizontalThreshold =
        horizontalThreshold *
        PERSISTENCE_MULTIPLIER;

      const persistenceVerticalThreshold =
        verticalThreshold *
        PERSISTENCE_MULTIPLIER;

      const upPersistenceThreshold =
        verticalThreshold *
        UP_PERSISTENCE_MULTIPLIER;

      let stillLookingInDirection =
        false;

      if (
        direction ===
        "LEFT"
      ) {
        stillLookingInDirection =
          dx >=
          persistenceHorizontalThreshold;
      }

      else if (
        direction ===
        "RIGHT"
      ) {
        stillLookingInDirection =
          dx <=
          -persistenceHorizontalThreshold;
      }

      else if (
        direction ===
        "UP"
      ) {

        stillLookingInDirection =
          dy <=
          -upPersistenceThreshold;
      }

      
      if (!stillLookingInDirection) {
        console.log(
          "[GAZE] PERSISTENCE BROKEN",
          {
            direction,

            dx:
              dx.toFixed(3),

            dy:
              dy.toFixed(3),

            persistenceThresholdX:
              persistenceHorizontalThreshold.toFixed(3),

            persistenceThresholdY:
              persistenceVerticalThreshold.toFixed(3),

            upPersistenceThreshold:
              upPersistenceThreshold.toFixed(3),
          }
        );

        persistenceStartedAt.current =
          null;

        return;
      }

      // start persistence
      if (
        persistenceStartedAt.current ===
        null
      ) {
        persistenceStartedAt.current =
          now;

        console.log(
          "[GAZE] PERSISTENCE STARTED",
          {
            direction,

            dx:
              dx.toFixed(3),

            dy:
              dy.toFixed(3),

            requiredMs:
              ALERT_TIME,

            persistenceThresholdX:
              persistenceHorizontalThreshold.toFixed(
                3
              ),

            persistenceThresholdY:
              persistenceVerticalThreshold.toFixed(
                3
              ),
          }
        );
      }

      // duration of persistance
      const persistenceDuration =
        now -
        persistenceStartedAt.current;

      // ALERTS
      if (
        persistenceDuration >=
        ALERT_TIME &&
        !excursionAlerted.current
      ) {
        excursionAlerted.current =
          true;

        let nextAlert: GazeAlertType;

        if (
          direction ===
          "LEFT"
        ) {
          nextAlert =
            "LOOKING_AWAY_LEFT";
        } else if (
          direction ===
          "RIGHT"
        ) {
          nextAlert =
            "LOOKING_AWAY_RIGHT";
        } else {
          nextAlert =
            "LOOKING_AWAY_UP";
        }

        console.log(
          "%c[GAZE ALERT] REAL ALERT",
          "color:#FF1744;font-weight:bold;",
          {
            alert:
              nextAlert,

            direction,

            dx:
              dx.toFixed(3),

            dy:
              dy.toFixed(3),

            duration:
              Math.round(
                persistenceDuration
              ),
          }
        );

        setAlert(nextAlert);

        // SUPABASE
        if (!sessionId) {
          console.error(
            "[GAZE ALERT] No sessionId",
            nextAlert
          );
        } else {
          void logFraudEvent({
            sessionId,
            eventType:
              nextAlert,
          });
        }
      }
    }, dynamicRate);

    return () => {
      window.clearInterval(interval);
    };
  }, [
    state,
    baseline,
    dynamicRate,
    startExam,
    warmupDone,
    sessionId,
  ]);

  return {
    alert,
    warmupCountdown,
  };
}