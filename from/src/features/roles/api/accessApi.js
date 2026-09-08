import { apiClient } from '@/lib/axios/apiClient'

export const accessApi = {
  getRoles: async () => {
    const { data } = await apiClient.get('/roles/')
    return data.data
  },
  createRole: async (payload) => {
    const { data } = await apiClient.post('/roles/', payload)
    return data.data
  },
  updateRole: async ({ id, payload }) => {
    const { data } = await apiClient.patch(`/roles/${id}/`, payload)
    return data.data
  },
  getPermissions: async () => {
    const { data } = await apiClient.get('/permissions/')
    return data.data
  },
  getOptions: async () => {
    const { data } = await apiClient.get('/access-options/')
    return data.data
  },
}
