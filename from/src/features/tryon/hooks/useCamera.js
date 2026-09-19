import { useEffect, useRef, useState } from 'react'

export function useCamera() {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [active, setActive] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const start = async () => {
    setError('')
    setLoading(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setActive(true)
    } catch (e) {
      let msg = 'No se pudo activar la cámara.'
      if (e.name === 'NotAllowedError') msg = 'Permiso de cámara denegado. Activa en el navegador o usa maniquí virtual.'
      if (e.name === 'NotFoundError') msg = 'No se encontró cámara frontal.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const stop = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    setActive(false)
  }

  useEffect(() => () => stop(), [])

  return { videoRef, active, error, loading, start, stop }
}
