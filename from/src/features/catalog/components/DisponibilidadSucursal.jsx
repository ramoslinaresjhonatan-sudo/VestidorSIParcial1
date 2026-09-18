import { useEffect, useState } from 'react'
import { MapPin, Clock, Phone, Navigation, WifiOff, Truck, Store } from 'lucide-react'
import { Button } from '@/components/ui/Button/Button'
import { Spinner } from '@/components/ui/Spinner/Spinner'
import { useDisponibilidad } from '../hooks/useCatalog'
import './DisponibilidadSucursal.css'

export function DisponibilidadSucursal({ productoId, talla, color, onClose }) {
  const [coords, setCoords] = useState({ lat: null, lon: null })
  const [geoError, setGeoError] = useState('')
  const [manual, setManual] = useState(false)

  const params = {
    talla: talla || undefined,
    color: color || undefined,
    lat: coords.lat ?? undefined,
    lon: coords.lon ?? undefined,
  }

  const query = useDisponibilidad(productoId, params)
  const [cached, setCached] = useState(null)

  useEffect(() => {
    if (query.data) localStorage.setItem(`disponibilidad_${productoId}_${talla}_${color}`, JSON.stringify(query.data))
  }, [query.data, productoId, talla, color])

  useEffect(() => {
    if (query.isError && !navigator.onLine) {
      const c = localStorage.getItem(`disponibilidad_${productoId}_${talla}_${color}`)
      if (c) setCached(JSON.parse(c))
    }
  }, [query.isError, productoId, talla, color])

  const data = query.data || cached
  const isOffline = !navigator.onLine || !!cached

  const requestGeo = () => {
    setGeoError('')
    if (!navigator.geolocation) return setGeoError('Geolocalización no soportada por este navegador. Ingresa coordenadas manualmente.')
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => {
        if (err.code === 1) setGeoError('Permiso denegado. Activa la geolocalización en tu navegador o ingresa tu ubicación manualmente.')
        else setGeoError('No se pudo obtener tu ubicación: ' + err.message)
        setManual(true)
      },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  return (
    <div className="disponibilidad">
      <div className="disponibilidad__head">
        <h3><Store size={16} /> Disponibilidad por sucursal</h3>
        {talla || color ? <small>Filtrando: {talla ? `Talla ${talla}` : ''} {color ? `Color ${color}` : ''}</small> : <small>Stock total por sucursal</small>}
      </div>

      <div className="disponibilidad__actions">
        <Button variant="secondary" icon={Navigation} onClick={requestGeo}>Usar mi ubicación (más cercana)</Button>
        <Button variant="secondary" onClick={() => setManual((v) => !v)}>Ingresar manualmente</Button>
      </div>

      {manual && (
        <div className="disponibilidad__manual">
          <input type="number" step="0.000001" placeholder="Latitud ej: -16.50" value={coords.lat ?? ''} onChange={(e) => setCoords((p) => ({ ...p, lat: e.target.value ? Number(e.target.value) : null }))} />
          <input type="number" step="0.000001" placeholder="Longitud ej: -68.12" value={coords.lon ?? ''} onChange={(e) => setCoords((p) => ({ ...p, lon: e.target.value ? Number(e.target.value) : null }))} />
        </div>
      )}

      {geoError && <div className="form-alert form-alert--warning">{geoError}</div>}
      {isOffline && <div className="page-notice page-notice--warning"><WifiOff size={12} /> Sin conexión — mostrando último cacheo</div>}

      {query.isLoading && !cached ? <Spinner /> : data ? (
        <>
          {data.solo_almacen && (
            <div className="page-notice" style={{ background: '#fef3c7', border: '1px solid #fcd34d', padding: 10, borderRadius: 8 }}>
              <Truck size={14} /> Producto solo en almacén central — <strong>Disponible solo para envío a domicilio</strong>
            </div>
          )}

          <div className="disponibilidad__map">
            <div className="map-placeholder">
              <MapPin size={28} />
              <span>Mapa de sucursales {coords.lat ? `(tu ubicación: ${Number(coords.lat).toFixed(4)}, ${Number(coords.lon).toFixed(4)})` : ''}</span>
              <small>Cada pin = {data.sucursales.length} sucursales • Distancia calculada por Haversine</small>
            </div>
          </div>

          <ul className="disponibilidad__list">
            {data.sucursales.map((s) => (
              <li key={s.id} className={`disponibilidad__item ${s.stock === 0 ? 'out' : 'in'}`}>
                <div className="disponibilidad__item-head">
                  <strong>{s.nombre}</strong>
                  <span className={`stock-badge ${s.stock > 0 ? 'ok' : 'zero'}`}>{s.stock} unidades {talla || color ? `(${talla || '∗'}/${color || '∗'})` : ''}</span>
                </div>
                <p><MapPin size={12} /> {s.direccion} — {s.ciudad}</p>
                <p><Phone size={12} /> {s.telefono} &nbsp; <Clock size={12} /> {s.horario}</p>
                {s.distance_km != null && <p><Navigation size={12} /> {s.distance_km} km • ~{s.tiempo_estimado_min} min en auto</p>}
                <div className="detalle-tallas">
                  {s.detalle_por_talla_color.map((d, idx) => (
                    <span key={idx} className={d.stock === 0 ? 'zero' : ''}>{d.talla}/{d.color}: {d.stock}</span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>Sin datos de disponibilidad.</p>
      )}
    </div>
  )
}
