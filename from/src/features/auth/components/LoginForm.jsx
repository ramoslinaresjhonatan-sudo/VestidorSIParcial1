import { useState } from 'react'
import { Link } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button/Button'
import { handleApiError } from '@/utils/handleApiError'
import { loginSchema } from '../schemas/loginSchema'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true">
      <path fill="#4285f4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.91h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.4Z" />
      <path fill="#34a853" d="M12 22c2.7 0 4.98-.9 6.63-2.43l-3.24-2.54c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z" />
      <path fill="#fbbc05" d="M6.39 13.86A6 6 0 0 1 6.07 12c0-.65.11-1.28.32-1.86V7.52H3.04A10 10 0 0 0 2 12c0 1.61.38 3.14 1.04 4.48l3.35-2.62Z" />
      <path fill="#ea4335" d="M12 6.01c1.47 0 2.79.51 3.83 1.5l2.87-2.88A9.64 9.64 0 0 0 12 2a10 10 0 0 0-8.96 5.52l3.35 2.62C7.18 7.77 9.39 6.01 12 6.01Z" />
    </svg>
  )
}

export function LoginForm({ onSubmit, loading }) {
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { correo: '', password: '' },
  })

  const submit = async (values) => {
    setServerError('')
    try {
      await onSubmit(values)
    } catch (error) {
      setServerError(handleApiError(error))
    }
  }

  return (
    <form className="login-form" onSubmit={handleSubmit(submit)} noValidate>
      {serverError && <div className="form-alert form-alert--danger">{serverError}</div>}

      <label className="field-group" htmlFor="correo">
        <span>Correo institucional</span>
        <div className={`field-control ${errors.correo ? 'field-control--error' : ''}`}>
          <Mail size={18} />
          <input
            id="correo"
            type="email"
            autoComplete="email"
            placeholder="nombre@institucion.edu"
            {...register('correo')}
          />
        </div>
        {errors.correo && <small>{errors.correo.message}</small>}
      </label>

      <label className="field-group" htmlFor="password">
        <span>Contraseña</span>
        <div className={`field-control ${errors.password ? 'field-control--error' : ''}`}>
          <LockKeyhole size={18} />
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Ingresa tu contraseña"
            {...register('password')}
          />
          <button
            className="password-toggle"
            type="button"
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            onClick={() => setShowPassword((value) => !value)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && <small>{errors.password.message}</small>}
      </label>

      <Button type="submit" loading={loading} className="login-submit">
        Ingresar al sistema
      </Button>

      <div className="login-divider"><span>o</span></div>

      <button className="google-login-button" type="button">
        <GoogleIcon />
        <span>Continuar con Google</span>
      </button>

      <div className="register-option" style={{ marginTop: '15px', textAlign: 'center' }}>
      <span style={{ color: '#666' }}>¿No tienes una cuenta? </span>
       <Link to="/registro" style={{ color: '#0066cc', textDecoration: 'underline', fontWeight: 'bold' }}>
         Regístrate aquí
       </Link>
       </div>

    </form>
  )
}
