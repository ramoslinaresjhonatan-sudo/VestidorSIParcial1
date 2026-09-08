import { apiClient } from '@/lib/axios/apiClient'
import { getStoredUser } from '@/utils/authSession'

export const authApi = {
  login: async (credentials) => {
    const { data } = await apiClient.post('/auth/token/', credentials)
    return data
  },

  getCurrentUser: async () => {
    const storedUser = getStoredUser()
    if (!storedUser.id) return null
    const { data } = await apiClient.get(`/users/${storedUser.id}/`)
    return data.data
  },
}
