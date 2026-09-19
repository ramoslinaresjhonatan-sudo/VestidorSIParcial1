import { useEffect, useRef } from 'react'

export function TryOnCanvas({ videoRef, pose, talla, color, producto, rotation, scaleFactor }) {
  const canvasRef = useRef(null)
  const overlayImgRef = useRef(null)

  const tallaEscala = { XS: 0.85, S: 0.92, M: 1.0, L: 1.08, XL: 1.15, XXL: 1.22 }

  useEffect(() => {
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas || !video) return
    const ctx = canvas.getContext('2d')
    let raf
    const draw = () => {
      if (video.videoWidth === 0) { raf = requestAnimationFrame(draw); return }
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      // video espejado
      ctx.save()
      ctx.scale(-1, 1)
      ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height)
      ctx.restore()

      // overlay prenda
      const img = overlayImgRef.current
      if (img && img.complete && img.naturalWidth && pose) {
        const baseScale = tallaEscala[talla] || 1.0
        const scale = baseScale * (scaleFactor || 1)
        const shoulderW = pose.shoulderWidth * scale
        const imgRatio = img.naturalHeight / img.naturalWidth
        const drawW = shoulderW * 1.6
        const drawH = drawW * imgRatio
        const x = pose.centerX - drawW / 2
        const y = pose.centerY - drawH * 0.35
        ctx.save()
        ctx.translate(x + drawW / 2, y + drawH / 2)
        ctx.rotate((rotation * Math.PI) / 180)
        ctx.globalAlpha = 0.92
        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH)
        ctx.restore()
      }
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [pose, talla, rotation, scaleFactor, videoRef])

  return (
    <>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', borderRadius: 12, background: '#111' }} />
      <img
        ref={overlayImgRef}
        src={producto?.imagen_url || producto?.imagen || ''}
        alt={producto?.nombre}
        style={{ display: 'none' }}
        crossOrigin="anonymous"
      />
      {/* video hidden, usado como fuente */}
      <video ref={videoRef} autoPlay playsInline muted style={{ display: 'none' }} />
    </>
  )
}
