import { useEffect, useRef, useState } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { drawLandmarks } from "../utils/drawLandmarks";

type FaceLandmarkerOptions = {
  fps?: number;          // target FPS (for throttling)
  maxDurationMs?: number; // auto-stop after this time (optional)
};

export function useFaceLandmarker(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  options?: FaceLandmarkerOptions
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [cameraReady, setCameraReady] = useState(false);

  useEffect(() => {
    if (!videoRef || !videoRef.current) return;

    let landmarker: FaceLandmarker | null = null;
    let animationFrameId: number;
    let stopTimeout: number | undefined;

    const fps = options?.fps ?? 60; // Phase 2 keeps full speed by default
    const maxDurationMs = options?.maxDurationMs; // Phase 2: undefined → no auto-stop
    const frameInterval = 1000 / fps;
    let lastTime = 0;

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

        if (!ctx || video.videoWidth === 0 || video.videoHeight === 0) return;

        if (!cameraReady) {
          setCameraReady(true);
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const detection = landmarker.detectForVideo(video, now);
        setResults(detection);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (detection.faceLandmarks?.length > 0) {
          drawLandmarks(
            ctx,
            detection.faceLandmarks[0],
            canvas.width,
            canvas.height
          );
        }
      };

      animationFrameId = requestAnimationFrame(render);

      if (maxDurationMs != null) {
        // Phase 1: auto-stop after given duration
        stopTimeout = window.setTimeout(() => {
          cancelAnimationFrame(animationFrameId);
          landmarker?.close();
          console.log("FaceLandmarker: auto-stopped after", maxDurationMs, "ms");
        }, maxDurationMs);
      }
    }

    init();

    return () => {
      if (stopTimeout !== undefined) {
        clearTimeout(stopTimeout);
      }
      cancelAnimationFrame(animationFrameId);
      landmarker?.close();
    };
  }, [videoRef, options?.fps, options?.maxDurationMs]);

  return { canvasRef, isLoaded, results, cameraReady };
}
