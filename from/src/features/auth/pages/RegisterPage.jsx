// src/features/auth/pages/RegisterPage.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import { authApi } from '../api/authApi'
import { handleApiError } from '@/utils/handleApiError'

export function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    correo: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      console.log('Registrando:', form)
      const data = await authApi.register(form)
      console.log('Registro OK:', data)
      setSuccess('✅ Registro exitoso! Redirigiendo al login...')
      setTimeout(() => navigate(ROUTES.LOGIN), 1500)
    } catch (err) {
      console.error('Error registro:', err)
      setError(handleApiError(err) || '❌ Error al registrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f0f2f5',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        maxWidth: '500px',
        width: '100%'
      }}>
        <h1 style={{ textAlign: 'center', color: '#1a1a2e' }}>Crear cuenta</h1>
        <p style={{ textAlign: 'center', color: '#666' }}>Regístrate para acceder</p>

        {error && <div style={{ background: '#fee', color: '#c00', padding: '10px', borderRadius: '6px', margin: '10px 0' }}>{error}</div>}
        {success && <div style={{ background: '#efe', color: '#060', padding: '10px', borderRadius: '6px', margin: '10px 0' }}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="nombre"
            placeholder="Nombre"
            value={form.nombre}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '10px', margin: '8px 0', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' }}
          />
          <input
            type="text"
            name="apellido_paterno"
            placeholder="Apellido paterno"
            value={form.apellido_paterno}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '10px', margin: '8px 0', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' }}
          />
          <input
            type="text"
            name="apellido_materno"
            placeholder="Apellido materno"
            value={form.apellido_materno}
            onChange={handleChange}
            style={{ width: '100%', padding: '10px', margin: '8px 0', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' }}
          />
          <input
            type="email"
            name="correo"
            placeholder="Correo electrónico"
            value={form.correo}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '10px', margin: '8px 0', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' }}
          />
          <input
            type="password"
            name="password"
            placeholder="Contraseña (mín. 8 caracteres)"
            value={form.password}
            onChange={handleChange}
            minLength={8}
            required
            style={{ width: '100%', padding: '10px', margin: '8px 0', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: loading ? '#aaa' : '#0066cc',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '10px'
            }}
          >
            {loading ? 'Registrando...' : 'Registrarme'}
          </button>
        </form>

        <Link to={ROUTES.LOGIN} style={{ display: 'block', textAlign: 'center', marginTop: '16px', color: '#666', textDecoration: 'none' }}>
          <ArrowLeft size={16} style={{ verticalAlign: 'middle' }} /> Ya tengo una cuenta
        </Link>
      </div>
    </div>
  )
}