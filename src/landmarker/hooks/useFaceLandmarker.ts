import { useEffect, useRef, useState } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { drawLandmarks } from "../utils/drawLandmarks";

// smoothing
const distanceBuffer: number[] = [];
const MAX_BUFFER = 12; // ~0.2 seconds of smoothing

function smoothDistance(zValue: number) {
  distanceBuffer.push(zValue);

  if (distanceBuffer.length > MAX_BUFFER) {
    distanceBuffer.shift();
  }

  const sum = distanceBuffer.reduce((a, b) => a + b, 0);
  return sum / distanceBuffer.length;
}

export function useFaceLandmarker(
  videoRef: React.RefObject<HTMLVideoElement | null>
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // ⭐ FIX: use ref instead of state (no re-renders)
  const resultsRef = useRef<any>(null);

  useEffect(() => {
    if (!videoRef || !videoRef.current) return;

    let landmarker: FaceLandmarker | null = null;
    let animationFrameId: number;

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

        // ⭐ SAFE SETTINGS — reduce load without losing features
        numFaces: 1,
        outputFaceBlendshapes: false,
        outputFacialTransformationMatrixes: false,
      });


      setIsLoaded(true);

      // ⭐ CORRECT: declare frameSkip OUTSIDE render()
      let frameSkip = 0;

      // Start detection loop
      const render = () => {
        if (!videoRef.current || !canvasRef.current || !landmarker) {
          animationFrameId = requestAnimationFrame(render);
          return;
        }

        // ⭐ FPS throttle: skip every 2nd frame
        frameSkip++;
        if (frameSkip % 2 !== 0) {
          animationFrameId = requestAnimationFrame(render);
          return;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        if (!ctx || video.videoWidth === 0 || video.videoHeight === 0) {
          animationFrameId = requestAnimationFrame(render);
          return;
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const detection = landmarker.detectForVideo(video, performance.now());

        // ⭐ FIX: store in ref, not state
        resultsRef.current = detection;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (detection.faceLandmarks?.length > 0) {
  // ⭐ TEST 1: disable drawing completely
  // drawLandmarks(ctx, detection.faceLandmarks[0], canvas.width, canvas.height);

  const rawZ = detection.faceLandmarks[0][1].z;
  const smoothedZ = smoothDistance(rawZ);
}


        animationFrameId = requestAnimationFrame(render);
      };

      render();
    }

    init();

    return () => {
      cancelAnimationFrame(animationFrameId);
      landmarker?.close();
    };
  }, []);

  // ⭐ Return ref instead of state
  return { canvasRef, isLoaded, results: resultsRef };
}
