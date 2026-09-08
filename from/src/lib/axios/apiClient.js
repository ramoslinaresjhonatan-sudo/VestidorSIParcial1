import axios from 'axios'
import { env } from '@/config/env'
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  setSession,
} from '@/utils/authSession'

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
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
