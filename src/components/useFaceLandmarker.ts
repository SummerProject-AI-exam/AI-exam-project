import { useEffect, useRef, useState } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { drawLandmarks } from "./drawLandmarks";

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
      // Load WASM (WebAssembly) runtime, to run fast code in browser
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );

      
      // Create FaceLandmarker
      landmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
             // address of the AI model
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
        },
        // runningModel for video, 1 face
        runningMode: "VIDEO",
        numFaces: 1,
      });

      setIsLoaded(true);

      // Start detection loop
      const render = () => {
        if (!videoRef.current || !canvasRef.current || !landmarker) {
          animationFrameId = requestAnimationFrame(render);
          return;
        }
// take the video and canvas elemets
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

// ensure everything is ready, camera, canvas and model
        if (!ctx || video.videoWidth === 0 || video.videoHeight === 0) {
          animationFrameId = requestAnimationFrame(render);
          return;
        }
// canvas has to be the same size as video for the landmarks
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const detection = landmarker.detectForVideo(video, performance.now());
        setResults(detection);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

if (detection.faceLandmarks?.length > 0) {
  drawLandmarks(ctx, detection.faceLandmarks[0], canvas.width, canvas.height);
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
