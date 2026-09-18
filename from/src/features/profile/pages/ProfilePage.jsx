import { useEffect, useState } from 'react'
import { Spinner } from '@/components/ui/Spinner/Spinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage/ErrorMessage'
import { handleApiError } from '@/utils/handleApiError'
import { ProfileForm } from '../components/ProfileForm'
import { useProfile, useUpdateProfile, useOfflineSync } from '../hooks/useProfile'
import { hasPendingProfile, getPendingProfile } from '../utils/offlineSync'
import { getUserRole } from '@/utils/accessControl'
import './ProfilePage.css'

export function ProfilePage() {
  const profileQuery = useProfile()
  const updateMutation = useUpdateProfile()
  const { syncIfNeeded, isSyncing } = useOfflineSync()
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [offlineNotice, setOfflineNotice] = useState(() => hasPendingProfile())

  useEffect(() => {
    const handleOnline = async () => {
      const synced = await syncIfNeeded()
      if (synced) {
        setNotice('Cambios pendientes sincronizados correctamente.')
        setOfflineNotice(false)
        setTimeout(() => setNotice(''), 4000)
      } else if (hasPendingProfile()) {
        setOfflineNotice(true)
      }
    }
    const handleOffline = () => setOfflineNotice(hasPendingProfile())
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    // intentar sincronizar al montar si hay pendiente y hay conexión
    if (navigator.onLine && hasPendingProfile()) handleOnline()
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [syncIfNeeded])

  const handleSubmit = (payload) => {
    setError('')
    setNotice('')
    updateMutation.mutate(payload, {
      onSuccess: (data) => {
        // data viene del backend con mensaje, pero usamos success_response.data
        setNotice(data?.message || 'Perfil actualizado correctamente.')
        setTimeout(() => setNotice(''), 4000)
      },
      onError: (err) => {
        if (err.message === 'OFFLINE_SAVED') {
          setOfflineNotice(true)
          setNotice('Sin conexión: cambios guardados localmente. Se sincronizarán automáticamente al reconectarte.')
          setTimeout(() => setNotice(''), 5000)
        } else {
          setError(handleApiError(err))
        }
      },
    })
  }

  if (profileQuery.isLoading) return <div className="page-shell"><Spinner /></div>
  if (profileQuery.isError) return <div className="page-shell"><ErrorMessage message={handleApiError(profileQuery.error)} onRetry={profileQuery.refetch} /></div>

  const user = profileQuery.data
  const pending = getPendingProfile()
  const role = getUserRole(user)
  const roleLabels = { administrador: 'Administrador', vendedor: 'Vendedor', cajero: 'Cajero', cliente: 'Cliente' }
  const roleDesc = {
    administrador: 'Gestiona usuarios, inventario y configuración del sistema.',
    vendedor: `Vendedor${user?.sucursal ? ` — ${user.sucursal.nombre} (${user.sucursal.ciudad})` : ''}: gestiona inventario de tu sucursal.`,
    cajero: 'Cajero: gestiona ventas y cobranzas de tu sucursal.',
    cliente: 'Visualiza y actualiza tus datos personales, talla y preferencias.',
  }

  return (
    <section className="page-shell profile-page">
      <div className="page-heading">
        <div>
          <h1>Mi Perfil <span className={`role-badge role-badge--${role}`}>{roleLabels[role]}</span></h1>
          <p>{roleDesc[role]}</p>
        </div>
        <span className={`profile-status ${user?.correo_verificado ? 'profile-status--verified' : 'profile-status--pending'}`}>
          {user?.correo_verificado ? '✓ Correo verificado' : '⚠ Verificación pendiente'}
        </span>
      </div>
      <div className="role-info" style={{ marginBottom: 12 }}>
        <span className={`role-badge role-badge--${role}`}>{roleLabels[role].toUpperCase()}</span>
        {user?.sucursal && <small style={{ marginLeft: 8 }}>Sucursal: <strong>{user.sucursal.nombre} — {user.sucursal.ciudad}</strong></small>}
        {user?.es_superadministrador && <small style={{ marginLeft: 8 }}>• Superadministrador</small>}
      </div>

      {notice && <div className="page-notice page-notice--success">{notice}</div>}
      {offlineNotice && pending && (
        <div className="page-notice page-notice--warning">
          Tienes cambios pendientes sin sincronizar (guardados localmente el {new Date(pending.timestamp).toLocaleString()}).
          {isSyncing ? ' Sincronizando...' : ' Se enviarán al recuperar la conexión.'}
        </div>
      )}
      {!navigator.onLine && (
        <div className="page-notice page-notice--warning">Estás sin conexión. Los cambios se guardarán localmente y se sincronizarán después.</div>
      )}

      <div className="surface-card profile-card">
        <div className="profile-summary">
          <div className="profile-avatar">{(user?.nombre?.[0] || 'U').toUpperCase()}</div>
          <div>
            <strong>{user?.nombre} {user?.apellido_paterno} {user?.apellido_materno}</strong>
            <small>{user?.correo}</small>
            {user?.talla_sugerida && <span className="profile-talla">Talla sugerida: <b>{user.talla_sugerida}</b></span>}
          </div>
        </div>

        <ProfileForm user={user} onSubmit={handleSubmit} loading={updateMutation.isPending} serverError={error} />
      </div>
    </section>
  )
}
