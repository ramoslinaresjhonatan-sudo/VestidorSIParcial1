import { apiClient } from '@/lib/axios/apiClient'

export const profileApi = {
  getMe: async () => {
    const { data } = await apiClient.get('/auth/me/')
    return data.data || data
  },
  updateMe: async (payload) => {
    const { data } = await apiClient.patch('/auth/me/', payload)
    return data.data || data
  },
}
