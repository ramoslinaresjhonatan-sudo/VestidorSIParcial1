import { useEffect, useState } from 'react'
import { Mic, MicOff, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/Button/Button'

const respuestasIA = (pregunta, producto) => {
  const q = pregunta.toLowerCase()
  if (q.includes('talla')) return `Para tu perfil, te recomiendo talla ${producto?.talla || 'M'}. Si dudas entre dos, elige la mayor para mayor comodidad.`
  if (q.includes('tela') || q.includes('material')) return `La tela es ${producto?.tela || producto?.detalle || 'suave y transpirable'}, ideal para uso diario. ${producto?.cuidados || ''}`
  if (q.includes('color')) return `El color ${producto?.color} combina con neutros. Tenemos también ${producto?.marca || 'otras'} variantes.`
  if (q.includes('precio') || q.includes('cuesta')) return `El precio es ${producto?.precio_formateado || 'consultar'}, con envío disponible.`
  if (q.includes('stock') || q.includes('disponible')) return `Stock total ${producto?.stock} unidades. Puedes ver disponibilidad por sucursal.`
  return `Soy tu asistente de ${producto?.nombre}. Pregunta sobre talla, tela, color, precio o disponibilidad.`
}

export function VozIA({ producto }) {
  const [escuchando, setEscuchando] = useState(false)
  const [pregunta, setPregunta] = useState('')
  const [respuesta, setRespuesta] = useState('')
  const [soportado, setSoportado] = useState(true)

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) || !('speechSynthesis' in window)) {
      setSoportado(false)
    }
  }, [])

  const hablar = (texto) => {
    const utter = new SpeechSynthesisUtterance(texto)
    utter.lang = 'es-BO'
    utter.rate = 0.95
    window.speechSynthesis.speak(utter)
  }

  const escuchar = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return
    const rec = new SR()
    rec.lang = 'es-BO'
    rec.interimResults = false
    rec.onstart = () => setEscuchando(true)
    rec.onend = () => setEscuchando(false)
    rec.onerror = () => setEscuchando(false)
    rec.onresult = (e) => {
      const txt = e.results[0][0].transcript
      setPregunta(txt)
      const resp = respuestasIA(txt, producto)
      setRespuesta(resp)
      hablar(resp)
    }
    rec.start()
  }

  const preguntarTexto = () => {
    if (!pregunta.trim()) return
    const resp = respuestasIA(pregunta, producto)
    setRespuesta(resp)
    hablar(resp)
  }

  if (!soportado) return <div className="form-alert form-alert--warning">Voz no soportada en este navegador. Usa Chrome.</div>

  return (
    <div className="voz-ia surface-card" style={{ padding: 12, display: 'grid', gap: 8, border: '1px solid #e0e7ff' }}>
      <h3 style={{ display: 'flex', gap: 6, alignItems: 'center' }}><Mic size={16} /> Asistente por voz — {producto?.nombre}</h3>
      <div style={{ display: 'flex', gap: 8 }}>
        <Button icon={escuchando ? MicOff : Mic} onClick={escuchar} variant={escuchando ? 'danger' : 'primary'}>{escuchando ? 'Escuchando...' : 'Hablar'}</Button>
        <Button icon={Volume2} variant="secondary" onClick={() => respuesta && hablar(respuesta)} disabled={!respuesta}>Repetir</Button>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <input value={pregunta} onChange={(e) => setPregunta(e.target.value)} placeholder="O escribe: ¿Qué tela es? ¿Qué talla me queda?" style={{ flex: 1, padding: 8, border: '1px solid #e5e7eb', borderRadius: 8 }} />
        <Button onClick={preguntarTexto}>Preguntar</Button>
      </div>
      {respuesta && <div style={{ background: '#f0f9ff', padding: 10, borderRadius: 8 }}><strong>IA:</strong> {respuesta}</div>}
      <small style={{ color: '#64748b' }}>Ej: "¿Qué talla me recomiendas?", "¿De qué tela es?"</small>
    </div>
  )
}
