import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Camera, RotateCw, Move, Aperture, Video, Save, WifiOff, AlertTriangle, ArrowLeft, Sparkles, Ruler } from 'lucide-react'
import { isAuthenticated } from '@/utils/authSession'
import { Button } from '@/components/ui/Button/Button'
import { Spinner } from '@/components/ui/Spinner/Spinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage/ErrorMessage'
import { handleApiError } from '@/utils/handleApiError'
import { useProductDetail } from '@/features/catalog/hooks/useCatalog'
import { useProfile } from '@/features/profile/hooks/useProfile'
import { tryonApi } from '../api/tryonApi'
import { useCamera } from '../hooks/useCamera'
import { usePoseDetection } from '../hooks/usePoseDetection'
import { TryOnCanvas } from '../components/TryOnCanvas'
import { TryOnFallbackManiqui } from '../components/TryOnFallbackManiqui'
import { pushPending } from '../utils/offlineTryon'
import './TryOnPage.css'

export function TryOnPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const detailQuery = useProductDetail(id)
  const profileQuery = useProfile()
  const camera = useCamera()
  const pose = usePoseDetection(camera.videoRef, camera.active)

  useEffect(() => {
    if (!isAuthenticated()) navigate('/login', { replace: true })
  }, [navigate])

  const product = detailQuery.data
  const profile = profileQuery.data

  const [talla, setTalla] = useState('')
  const [color, setColor] = useState('')
  const [rotation, setRotation] = useState(0)
  const [scaleFactor, setScaleFactor] = useState(1)
  const [capturing, setCapturing] = useState(false)
  const [msg, setMsg] = useState('')
  const [needsMeasures, setNeedsMeasures] = useState(false)
  const canvasWrapRef = useRef(null)

  useEffect(() => {
    if (product) {
      setTalla(profile?.talla_sugerida || product.talla || 'M')
      setColor(product.color || '')
    }
  }, [product, profile])

  useEffect(() => {
    // CU-08 precondición: medidas
    if (profile && (!profile.altura || !profile.peso)) {
      setNeedsMeasures(true)
    }
  }, [profile])

  const hasMeasures = profile?.altura && profile?.peso

  const startCamera = async () => {
    if (!hasMeasures) {
      setNeedsMeasures(true)
      return
    }
    await camera.start()
  }

  const takePhoto = async () => {
    const canvas = document.querySelector('.tryon-canvas canvas')
    if (!canvas) return
    const dataUrl = canvas.toDataURL('image/png')
    // descarga local
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `prueba-${product.nombre}-${talla}-${Date.now()}.png`
    a.click()
    await guardarPrueba(dataUrl)
  }

  const [recording, setRecording] = useState(false)
  const mediaRecorderRef = useRef(null)

  const toggleVideo = async () => {
    const canvas = document.querySelector('.tryon-canvas canvas')
    if (!canvas) return
    if (recording) {
      mediaRecorderRef.current?.stop()
      setRecording(false)
      return
    }
    const stream = canvas.captureStream(30)
    const mr = new MediaRecorder(stream, { mimeType: 'video/webm' })
    const chunks = []
    mr.ondataavailable = (e) => chunks.push(e.data)
    mr.onstop = async () => {
      const blob = new Blob(chunks, { type: 'video/webm' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `prueba-${product.nombre}-${Date.now()}.webm`
      a.click()
      setMsg('Video descargado')
      setTimeout(() => setMsg(''), 3000)
    }
    mr.start()
    mediaRecorderRef.current = mr
    setRecording(true)
  }

  const guardarPrueba = async (dataUrl) => {
    const payload = { producto_id: Number(id), talla, color, captura_base64: dataUrl }
    if (!navigator.onLine) {
      pushPending(payload)
      setMsg('Sin conexión: prueba guardada localmente')
      setTimeout(() => setMsg(''), 4000)
      return
    }
    try {
      await tryonApi.guardar(payload)
      setMsg('Prueba guardada en tu perfil')
      setTimeout(() => setMsg(''), 3000)
    } catch (e) {
      pushPending(payload)
      setMsg('Guardado local (offline)')
      setTimeout(() => setMsg(''), 4000)
    }
  }

  if (detailQuery.isLoading) return <div className="page-shell"><Spinner /></div>
  if (detailQuery.isError) return <div className="page-shell"><ErrorMessage message={handleApiError(detailQuery.error)} onRetry={detailQuery.refetch} /></div>

  return (
    <section className="page-shell tryon-page">
      <button className="product-back" onClick={() => navigate(-1)}><ArrowLeft size={16} /> Volver</button>
      <div className="page-heading">
        <div>
          <h1><Camera size={20} /> Probar con cámara</h1>
          <p>{product.nombre} — superposición en tiempo real sobre tu cuerpo</p>
        </div>
        <Link to={`/catalogo/${id}`} className="link">Ver detalle</Link>
      </div>

      {msg && <div className="page-notice page-notice--success">{msg}</div>}
      {needsMeasures && (
        <div className="page-notice page-notice--warning" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <Ruler size={16} /> Sin medidas registradas (altura/peso). Para recomendación precisa ve a <Link to="/app/perfil">Mi Perfil</Link> o ingresa mano: <Button size="sm" onClick={() => setNeedsMeasures(false)}>Continuar igual</Button>
        </div>
      )}
      {!hasMeasures && !needsMeasures && (
        <div className="page-notice page-notice--warning"><AlertTriangle size={14} /> Sin medidas: la recomendación será genérica</div>
      )}

      <div className="tryon-grid">
        <div className="tryon-canvas surface-card" ref={canvasWrapRef}>
          {!camera.active && camera.error ? (
            <TryOnFallbackManiqui producto={product} talla={talla} color={color} />
          ) : !camera.active ? (
            <div style={{ height: 520, display: 'grid', placeItems: 'center', background: '#111', color: '#fff', borderRadius: 12 }}>
              <div style={{ textAlign: 'center' }}>
                <Camera size={48} />
                <p>Cámara inactiva</p>
                <Button icon={Camera} onClick={startCamera}>Activar cámara frontal</Button>
                <p style={{ marginTop: 8 }}><small>Requiere permisos + HTTPS</small></p>
                <Button variant="secondary" onClick={() => { setNeedsMeasures(false); }}>Probar con maniquí</Button>
              </div>
            </div>
          ) : (
            <TryOnCanvas videoRef={camera.videoRef} pose={pose} talla={talla} color={color} producto={product} rotation={rotation} scaleFactor={scaleFactor} />
          )}

          {camera.error && <div className="form-alert form-alert--warning" style={{ marginTop: 8 }}>{camera.error}</div>}
          {!navigator.onLine && <div className="page-notice page-notice--warning"><WifiOff size={12} /> Sin conexión — sesión guardada local</div>}
        </div>

        <div className="tryon-controls surface-card">
          <h3>Controles</h3>

          <label className="plain-field">Talla
            <select value={talla} onChange={(e) => setTalla(e.target.value)}>
              {['XS','S','M','L','XL','XXL','32','34','36','38','40'].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label className="plain-field">Color
            <input value={color} onChange={(e) => setColor(e.target.value)} placeholder={product.color} />
          </label>

          <div className="tryon-sliders">
            <label><RotateCw size={14} /> Girar 360° <input type="range" min={-30} max={30} value={rotation} onChange={(e) => setRotation(Number(e.target.value))} /> {rotation}°</label>
            <label><Move size={14} /> Escala (moverse/agacharse simula) <input type="range" min={0.85} max={1.25} step={0.05} value={scaleFactor} onChange={(e) => setScaleFactor(Number(e.target.value))} /> {scaleFactor.toFixed(2)}x</label>
          </div>

          <div style={{ background: '#eef2ff', padding: 10, borderRadius: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
            <Sparkles size={16} /> Recomendación: <strong>{profile?.talla_sugerida || 'M'}</strong> <small>según pecho {profile?.medida_pecho || '—'} / cintura {profile?.medida_cintura || '—'}</small>
          </div>

          <div className="tryon-actions">
            <Button icon={Aperture} onClick={takePhoto} disabled={!camera.active && !camera.error}>Tomar foto</Button>
            <Button icon={Video} variant={recording ? 'danger' : 'secondary'} onClick={toggleVideo} disabled={!camera.active}>{recording ? 'Detener video' : 'Grabar video'}</Button>
            <Button icon={Save} variant="secondary" onClick={() => {
              const canvas = document.querySelector('.tryon-canvas canvas')
              if (canvas) guardarPrueba(canvas.toDataURL('image/png'))
            }}>Guardar en perfil</Button>
          </div>

          <div className="tryon-tips">
            <p><strong>Tips:</strong> Aléjate 1.5m, buena luz, brazos ligeramente separados. Gire el slider para simular 360°, muévase para ver caída de tela.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
