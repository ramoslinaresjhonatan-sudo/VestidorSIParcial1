import { useEffect, useRef, useState } from 'react'

// Fase 1: detección simulada centrada + seguimiento básico hombros
// Fase 2: reemplazar por @mediapipe/pose o @tensorflow-models/pose-detection
export function usePoseDetection(videoRef, enabled) {
  const [pose, setPose] = useState(null) // { leftShoulder, rightShoulder, hip, centerX, scale }

  useEffect(() => {
    if (!enabled || !videoRef.current) return

    let raf
    const loop = () => {
      const video = videoRef.current
      if (!video || video.videoWidth === 0) {
        raf = requestAnimationFrame(loop)
        return
      }
      // Simulación: hombros al 35% y 65% del ancho, 35% alto, cadera 55% alto
      const w = video.videoWidth
      const h = video.videoHeight
      setPose({
        leftShoulder: { x: w * 0.35, y: h * 0.35 },
        rightShoulder: { x: w * 0.65, y: h * 0.35 },
        hip: { x: w * 0.5, y: h * 0.55 },
        shoulderWidth: w * 0.3,
        centerX: w * 0.5,
        centerY: h * 0.45,
      })
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [enabled, videoRef])

  return pose
}
