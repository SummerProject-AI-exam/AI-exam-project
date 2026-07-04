import { useEffect, useRef, useState } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

export function useFaceLandmarkerRaw(
  videoRef: React.RefObject<HTMLVideoElement | null>
) {
  const [results, setResults] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  const lastTimeRef = useRef(0);
  const THROTTLE_MS = 33; 

  useEffect(() => {
    let landmarker: FaceLandmarker | null = null;
    let animationFrameId: number;
    let active = true;

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
        numFaces: 1,
      });

      setIsLoaded(true);

      const render = (now: number) => {
        if (!active) return;

        const video = videoRef.current;

        animationFrameId = requestAnimationFrame(render);

        if (!video || !landmarker) return;

        if (!cameraReady) setCameraReady(true);

        if (now - lastTimeRef.current < THROTTLE_MS) {
          return; 
        }
        lastTimeRef.current = now;

        if (video.videoWidth === 0 || video.videoHeight === 0) {
          setResults(null);
        } else {
          const detection = landmarker.detectForVideo(video, now);
          setResults(detection);
        }
      };

      animationFrameId = requestAnimationFrame(render);
    }

    init();

    return () => {
      active = false;
      cancelAnimationFrame(animationFrameId);
      landmarker?.close();
    };
  }, []); 

  return {
    results,
    isLoaded,
    cameraReady,
  };
}
