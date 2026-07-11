import { useEffect, useRef, useState } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { drawLandmarks } from "../utils/drawLandmarks";

type FaceLandmarkerOptions = {
  fps?: number;
  maxDurationMs?: number;
  debug?: boolean;
};

export function useFaceLandmarker(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  options?: FaceLandmarkerOptions
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [cameraReady, setCameraReady] = useState(false);

  const lastGoodFrameRef = useRef<any>(null);
  const startedRef = useRef(false);

  let lastFilter = 0;

  function cheatingSafeFilter(detection: any, timestamp: number) {
    if (timestamp - lastFilter < 50) {
      return lastGoodFrameRef.current;
    }
    lastFilter = timestamp;

    const lastGood = lastGoodFrameRef.current;

    if (!detection || !detection.faceLandmarks || detection.faceLandmarks.length === 0) {
      return null;
    }

    const landmarks = detection.faceLandmarks[0];

    const zeroPoints = landmarks.filter((pt: any) => pt.x === 0 && pt.y === 0).length;
    if (zeroPoints > 10) {
      return lastGood;
    }

    if (!lastGood) {
      lastGoodFrameRef.current = detection;
      return detection;
    }

    const movement = computeMovement(lastGood, detection);
    if (movement > 0.12) {
      return lastGood;
    }

    lastGoodFrameRef.current = detection;
    return detection;
  }

  useEffect(() => {
    if (!videoRef || !videoRef.current) return;
    if (startedRef.current) return;
    startedRef.current = true;

    let landmarker: FaceLandmarker | null = null;
    let animationFrameId: number;
    let stopTimeout: number | undefined;

    const fps = options?.fps ?? 15; // ❄️ cooler default
    const maxDurationMs = options?.maxDurationMs;
    const frameInterval = 1000 / fps;
    let lastTime = 0;
    let lastResultUpdate = 0;

    async function init() {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );

      landmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
        },
        runningMode: "VIDEO",
        numFaces: 2,
      });

      setIsLoaded(true);

      const render = (now: number) => {
        animationFrameId = requestAnimationFrame(render);

        if (now - lastTime < frameInterval) return;
        lastTime = now;

        if (!videoRef.current || !canvasRef.current || !landmarker) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        if (!cameraReady) setCameraReady(true);
        if (!ctx) return;

        if (video.readyState < 2) {
          return;
        }

        if (video.videoWidth === 0 || video.videoHeight === 0) {
          return;
        }

        if (canvas.width !== video.videoWidth) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        const detection = landmarker.detectForVideo(video, now);
        //console.log("RAW LANDMARKER OUTPUT:", detection);

        const safeFrame = cheatingSafeFilter(detection, now);
        const frameToUse = safeFrame ?? detection;

        if (now - lastResultUpdate > frameInterval) {
          setResults({ ...frameToUse });
          lastResultUpdate = now;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (options?.debug && frameToUse?.faceLandmarks?.length > 0) {
          drawLandmarks(
            ctx,
            frameToUse.faceLandmarks[0],
            canvas.width,
            canvas.height
          );
        }
      };

      animationFrameId = requestAnimationFrame(render);

      if (maxDurationMs != null) {
        stopTimeout = window.setTimeout(() => {
          cancelAnimationFrame(animationFrameId);
          landmarker?.close();
        }, maxDurationMs);
      }
    }

    init();

    return () => {
      if (stopTimeout !== undefined) clearTimeout(stopTimeout);
      cancelAnimationFrame(animationFrameId);
      landmarker?.close();
    };
  }, [videoRef, options?.fps, options?.debug, options?.maxDurationMs]);

  return { canvasRef, isLoaded, results, cameraReady };
}

function computeMovement(prev: any, curr: any) {
  const prevPts = prev.faceLandmarks[0];
  const currPts = curr.faceLandmarks[0];

  let total = 0;
  let count = 0;

  for (let i = 0; i < prevPts.length; i++) {
    const dx = prevPts[i].x - currPts[i].x;
    const dy = prevPts[i].y - currPts[i].y;
    total += Math.sqrt(dx * dx + dy * dy);
    count++;
  }

  return total / count;
}
