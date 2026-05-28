import { useEffect, useRef, useState } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { drawLandmarks } from "../utils/drawLandmarks";

export function useFaceLandmarker(
  videoRef: React.RefObject<HTMLVideoElement | null>
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [results, setResults] = useState<any>(null);

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
        numFaces: 2,
      });

      setIsLoaded(true);

      const render = () => {
        if (!videoRef.current || !canvasRef.current || !landmarker) {
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
        setResults(detection); // ← this is the key

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (detection.faceLandmarks?.length > 0) {
          drawLandmarks(
            ctx,
            detection.faceLandmarks[0],
            canvas.width,
            canvas.height
          );
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

  return { canvasRef, isLoaded, results };
}
