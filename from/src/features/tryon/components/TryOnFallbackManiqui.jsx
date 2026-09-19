import { User } from 'lucide-react'

export function TryOnFallbackManiqui({ producto, talla, color }) {
  const escala = { XS: '82%', S: '88%', M: '100%', L: '110%', XL: '118%', XXL: '125%' }
  return (
    <div style={{ width: '100%', height: 520, background: '#f1f5f9', borderRadius: 12, display: 'grid', placeItems: 'center', position: 'relative', overflow: 'hidden', border: '1px dashed #cbd5e1' }}>
      <div style={{ textAlign: 'center' }}>
        <User size={80} color="#94a3b8" />
        <p style={{ color: '#64748b', marginTop: 8 }}>Maniquí virtual — cámara no disponible</p>
        <small style={{ color: '#94a3b8' }}>Talla {talla} • Color {color}</small>
      </div>
      {producto?.imagen_url && (
        <img
          src={producto.imagen_url}
          alt={producto.nombre}
          style={{
            position: 'absolute',
            top: '18%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: escala[talla] || '100%',
            maxWidth: 260,
            opacity: 0.9,
            filter: 'drop-shadow(0 8px 16px rgba(0,0,0,.15))',
          }}
        />
      )}
    </div>
  )
}
