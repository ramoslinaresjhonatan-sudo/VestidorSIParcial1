// src/features/auth/api/authApi.js
import { apiClient } from '@/lib/axios/apiClient'
import { getStoredUser } from '@/utils/authSession'

export const authApi = {
  // ✅ Login - Ruta CORRECTA para Simple JWT (baseURL ya incluye /api/v1)
  login: async (credentials) => {
    console.log('📡 Enviando login a:', '/auth/token/')
    console.log('📦 Credenciales:', credentials)
    
    try {
      const { data } = await apiClient.post('/auth/token/', credentials)
      console.log('✅ Login exitoso:', data)
      return data  // { access, refresh }
    } catch (error) {
      console.error('❌ Error en login:', error.response?.data || error.message)
      throw error
    }
  },

  // ✅ Refresh token
  refreshToken: async (refresh) => {
    const { data } = await apiClient.post('/auth/token/refresh/', { refresh })
    return data
  },

  // Obtener usuario actual
  getCurrentUser: async () => {
    const storedUser = getStoredUser()
    if (!storedUser?.id) return null
    try {
      const { data } = await apiClient.get(`/users/${storedUser.id}/`)
      return data.data || data
    } catch (error) {
      console.error('❌ Error al obtener usuario:', error)
      return null
    }
  },

  // Registro (si tienes endpoint)
  register: async (userData) => {
    console.log('📡 Enviando registro a:', '/auth/registro/')
    const { data } = await apiClient.post('/auth/registro/', userData)
    return data
  },
}