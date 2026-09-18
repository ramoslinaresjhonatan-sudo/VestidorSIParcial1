import { useEffect, useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { Button } from '@/components/ui/Button/Button'
import { profileSchema, suggestSize } from '../schemas/profileSchema'
import { getUserRole } from '@/utils/accessControl'

function defaults(user) {
  return {
    nombre: user?.nombre || '',
    apellido_paterno: user?.apellido_paterno || '',
    apellido_materno: user?.apellido_materno || '',
    correo: user?.correo || '',
    telefono: user?.telefono || '',
    direccion: user?.direccion || '',
    direccion_envio: user?.direccion_envio || '',
    metodo_pago_preferido: user?.metodo_pago_preferido || '',
    medida_pecho: user?.medida_pecho ?? '',
    medida_cintura: user?.medida_cintura ?? '',
    medida_cadera: user?.medida_cadera ?? '',
    altura: user?.altura ?? '',
    peso: user?.peso ?? '',
  }
}

export function ProfileForm({ user, onSubmit, loading, serverError }) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: defaults(user),
  })

  useEffect(() => reset(defaults(user)), [reset, user])

  const pecho = useWatch({ control, name: 'medida_pecho' })
  const cintura = useWatch({ control, name: 'medida_cintura' })

  const tallaPreview = useMemo(() => suggestSize(pecho, cintura) || user?.talla_sugerida || '', [pecho, cintura, user?.talla_sugerida])
  const hasTalla = Boolean(tallaPreview)
  const role = getUserRole(user)
  const isCliente = role === 'cliente'

  const submit = (values) => {
    const payload = {}
    const original = defaults(user)
    // Solo enviar campos cambiados + transformar vacíos a null para medidas
    Object.keys(values).forEach((key) => {
      let val = values[key]
      if (['medida_pecho', 'medida_cintura', 'medida_cadera', 'altura', 'peso'].includes(key)) {
        if (val === '' || val === undefined) val = null
        else val = Number(val)
      }
      if (String(val ?? '') !== String(original[key] ?? '')) {
        payload[key] = val
      }
    })
    // Si no hay cambios, no hacer nada
    if (Object.keys(payload).length === 0) return
    onSubmit(payload)
  }

  return (
    <form className="profile-form" onSubmit={handleSubmit(submit)}>
      {serverError && <div className="form-alert form-alert--danger">{serverError}</div>}
      {user?.correo_pendiente_verificacion && !user?.correo_verificado && (
        <div className="form-alert form-alert--warning">
          Cambio de email pendiente de verificación: <strong>{user.correo_pendiente_verificacion}</strong>. Revisa tu bandeja de entrada.
        </div>
      )}

      <fieldset className="profile-fieldset">
        <legend>Datos personales</legend>
        <div className="form-grid form-grid--two">
          <label className="plain-field">Nombre<span>*</span><input {...register('nombre')} placeholder="Ej. María" />{errors.nombre && <small>{errors.nombre.message}</small>}</label>
          <label className="plain-field">Apellido paterno<span>*</span><input {...register('apellido_paterno')} placeholder="Ej. Flores" />{errors.apellido_paterno && <small>{errors.apellido_paterno.message}</small>}</label>
          <label className="plain-field">Apellido materno<input {...register('apellido_materno')} placeholder="Ej. Vargas" />{errors.apellido_materno && <small>{errors.apellido_materno.message}</small>}</label>
          <label className="plain-field">Correo electrónico<span>*</span><input type="email" {...register('correo')} />{errors.correo && <small>{errors.correo.message}</small>}<small className="field-hint">Cambiar el email requerirá verificación nuevamente.</small></label>
          <label className="plain-field">Teléfono<input {...register('telefono')} placeholder="Ej. +591 70000000" />{errors.telefono && <small>{errors.telefono.message}</small>}</label>
        </div>
      </fieldset>

      <fieldset className="profile-fieldset">
        <legend>Dirección {isCliente ? 'y preferencias' : ''}</legend>
        <div className="form-grid">
          <label className="plain-field">Dirección<input {...register('direccion')} placeholder="Calle, número, zona" />{errors.direccion && <small>{errors.direccion.message}</small>}</label>
          {isCliente && <label className="plain-field">Dirección de envío<input {...register('direccion_envio')} placeholder="Si es distinta a la dirección principal" />{errors.direccion_envio && <small>{errors.direccion_envio.message}</small>}</label>}
          {isCliente && <label className="plain-field">Método de pago preferido
            <select {...register('metodo_pago_preferido')}>
              <option value="">-- Seleccionar --</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="paypal">PayPal</option>
              <option value="transferencia">Transferencia</option>
              <option value="efectivo">Efectivo contra entrega</option>
            </select>
            {errors.metodo_pago_preferido && <small>{errors.metodo_pago_preferido.message}</small>}
          </label>}
          {user?.sucursal && <div className="plain-field"><span>Sucursal asignada</span><strong>{user.sucursal.nombre} — {user.sucursal.ciudad}</strong><small>Asignada por administrador</small></div>}
          {!isCliente && user?.sucursal && <label className="plain-field">Sucursal (solo lectura)<input value={`${user.sucursal.nombre} — ${user.sucursal.ciudad}`} disabled /></label>}
        </div>
        {role !== 'cliente' && <p className="fieldset-hint">Cuenta {role}: talla corporal y método de pago solo para clientes.</p>}
      </fieldset>

      {isCliente && (
        <fieldset className="profile-fieldset">
          <legend>Medidas corporales</legend>
          <p className="fieldset-hint">Actualiza tus medidas y te sugerimos tu talla automáticamente.</p>
          <div className="form-grid form-grid--three">
            <label className="plain-field">Pecho (cm)<input type="number" step="0.1" {...register('medida_pecho')} placeholder="Ej. 92" />{errors.medida_pecho && <small>{errors.medida_pecho.message}</small>}</label>
            <label className="plain-field">Cintura (cm)<input type="number" step="0.1" {...register('medida_cintura')} placeholder="Ej. 74" />{errors.medida_cintura && <small>{errors.medida_cintura.message}</small>}</label>
            <label className="plain-field">Cadera (cm)<input type="number" step="0.1" {...register('medida_cadera')} placeholder="Ej. 96" />{errors.medida_cadera && <small>{errors.medida_cadera.message}</small>}</label>
            <label className="plain-field">Altura (m)<input type="number" step="0.01" {...register('altura')} placeholder="Ej. 1.65" />{errors.altura && <small>{errors.altura.message}</small>}</label>
            <label className="plain-field">Peso (kg)<input type="number" step="0.1" {...register('peso')} placeholder="Ej. 60" />{errors.peso && <small>{errors.peso.message}</small>}</label>
            <div className="plain-field plain-field--talla">
              <span>Talla sugerida</span>
              <strong className={`talla-badge ${hasTalla ? 'talla-badge--active' : ''}`}>{tallaPreview || '—'}</strong>
              <small>Se actualiza automáticamente al guardar.</small>
            </div>
          </div>
        </fieldset>
      )}

      <div className="form-actions">
        <Button type="submit" loading={loading} disabled={!isDirty || loading}>Guardar cambios</Button>
      </div>
    </form>
  )
}
