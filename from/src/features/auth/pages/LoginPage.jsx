import { useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import platformLogo from '@/assets/edugestion-platform-logo.png'
import { ROUTES } from '@/constants/routes'
import { isAuthenticated, setSession } from '@/utils/authSession'
import { LoginForm } from '../components/LoginForm'
import { useLogin } from '../hooks/useLogin'
import './LoginPage.css'

export function LoginPage() {
  const navigate = useNavigate()
  const login = useLogin()

  useEffect(() => {
    if (isAuthenticated()) navigate(ROUTES.DASHBOARD, { replace: true })
  }, [navigate])

  const handleLogin = async (credentials) => {
    const tokens = await login.mutateAsync(credentials)
    setSession({ ...tokens, email: credentials.correo })
    navigate(ROUTES.DASHBOARD, { replace: true })
  }

  return (
    <main className="login-page">
      <div className="login-shell">
        <div className="login-card">
          <section className="login-story">
            <div className="login-story__logo">
              <img src={platformLogo} alt="Logo de EduGestión" />
            </div>
            <div className="login-story__content">
              <h1>Gestión educativa simple.</h1>
              <p>Tu institución, organizada en un solo lugar.</p>
            </div>
          </section>

          <section className="login-panel">
            <div className="login-panel__inner">
              <div className="login-panel__heading">
                <h2>Inicia sesión</h2>
              </div>
              <LoginForm onSubmit={handleLogin} loading={login.isPending} />
              <Link className="login-return-link" to={ROUTES.HOME}>
                <ArrowLeft size={16} /> Volver al inicio
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
