import { apiClient } from '@/lib/axios/apiClient'

export const usersApi = {
  getAll: async ({ page = 1, pageSize = 20 } = {}) => {
    const { data } = await apiClient.get('/users/', {
      params: { page, page_size: pageSize },
    })
    return data.data
  },
  create: async (payload) => {
    const { data } = await apiClient.post('/users/', payload)
    return data.data
  },
  update: async ({ id, payload }) => {
    const { data } = await apiClient.patch(`/users/${id}/`, payload)
    return data.data
  },
  annul: async (id) => {
    const { data } = await apiClient.post(`/users/${id}/anular/`)
    return data.data
  },
  remove: async (id) => {
    const { data } = await apiClient.delete(`/users/${id}/`)
    return data
  },
}
