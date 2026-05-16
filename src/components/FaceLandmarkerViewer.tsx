import { useEffect, useRef } from "react";
import {
  FaceLandmarker,
  FilesetResolver,
} from "@mediapipe/tasks-vision";

export default function FaceLandmarkerViewer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
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

      //  Start webcam and wait for it to play
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (!videoRef.current) return;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      // Prediction loop
      const render = () => {
        // wait for it to be ready because of asyncronous loading of video and WASM model
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

        // run the API
        const results = landmarker.detectForVideo(video, performance.now());
        // clear the canvas 
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (results.faceLandmarks && results.faceLandmarks.length > 0) {
          const points = results.faceLandmarks[0];
          ctx.fillStyle = "cyan";

          // draw the landamrks as points 
          for (const p of points) {
            ctx.beginPath();
            ctx.arc(
              p.x * canvas.width,
              p.y * canvas.height,
              2,
              0,
              2 * Math.PI
            );
            ctx.fill();
          }
        }

        animationFrameId = requestAnimationFrame(render);
      };

      render();
    }

    init();

    return () => {
      cancelAnimationFrame(animationFrameId);
      landmarker?.close();
      if (videoRef.current?.srcObject instanceof MediaStream) {
        videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  return (
    <div style={{ position: "relative", width: "640px", maxWidth: "100%" }}>
      <video
        ref={videoRef}
        style={{ width: "100%", transform: "scaleX(-1)" }}
        playsInline
        muted
      />
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          transform: "scaleX(-1)",
        }}
      />
    </div>
  );
}
