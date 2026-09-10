// src/lib/axios/apiClient.js
import axios from 'axios'
import { env } from '@/config/env'
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  setSession,
} from '@/utils/authSession'

// ✅ FORZAR LA URL CORRECTA DIRECTAMENTE - incluye /api/v1 para que /users/, /billing/, /catalog/ funcionen
export const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/v1',
  timeout: 15_000,
  headers: { 
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Interceptor para agregar el token
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  // Si es FormData, dejar que el navegador ponga el boundary
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
    delete config.headers['content-type']
  }
  console.log(`📡 Petición a: ${config.baseURL}${config.url}`)  // ← Para debug
  return config
})

// Interceptor para manejar errores de autenticación
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ Respuesta de: ${response.config.url}`, response.status)
    return response
  },
  async (error) => {
    console.error('❌ Error en petición:', error.message)
    console.error('URL:', error.config?.url)
    
    const request = error.config
    const refresh = getRefreshToken()

    if (error.response?.status === 401 && refresh && !request?._retry) {
      request._retry = true
      try {
        const { data } = await axios.post(`${env.apiUrl}/auth/token/refresh/`, {
          refresh,
        })
        setSession({ access: data.access, refresh, email: getStoredUser().email })
        request.headers.Authorization = `Bearer ${data.access}`
        return apiClient(request)
      } catch {
        clearSession()
        window.dispatchEvent(new Event('auth:logout'))
      }
    }

    return Promise.reject(error)
  },
)