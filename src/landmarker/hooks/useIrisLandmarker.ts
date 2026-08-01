import { useEffect, useRef, useState } from "react"
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision"

export function useIrisLandmarker(
    videoRef: React.RefObject<HTMLVideoElement | null>
) {
    let rafId: number | null = null
    const landmarkerRef = useRef<FaceLandmarker | null>(null)
    const [results, setResults] = useState<any>(null)

    useEffect(() => {
        let lastTime = 0

        const fps = 8
        const frameInterval = 1000 / fps

        const staggerOffset = 60
        let staggerReady = false

        async function init() {
            const vision = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
            )

            landmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath:
                        "https://storage.googleapis.com/mediapipe-assets/face_landmarker_with_iris.task",
                },
                runningMode: "VIDEO",
                numFaces: 1,
            })

            const render = (now: number) => {
                rafId = requestAnimationFrame(render)

                if (!staggerReady) {
                    staggerReady = true
                    lastTime = now + staggerOffset
                    return
                }

                if (now - lastTime < frameInterval) return
                lastTime = now

                const video = videoRef.current
                if (!video || !landmarkerRef.current) return
                if (video.readyState < 2) return

                const detection = landmarkerRef.current.detectForVideo(video, now)
                setResults(detection)
            }

            rafId = requestAnimationFrame(render)
        }

        init()

        return () => {
            if (rafId !== null) cancelAnimationFrame(rafId)
        }
    }, [videoRef])

    return results
}
