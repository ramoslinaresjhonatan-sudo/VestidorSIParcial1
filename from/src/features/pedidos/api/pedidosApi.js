import { apiClient } from '@/lib/axios/apiClient'

export const pedidosApi = {
  list: async (params = {}) => {
    const { data } = await apiClient.get('/catalog/pedidos/', { params })
    return data.data
  },
  create: async (payload) => {
    const { data } = await apiClient.post('/catalog/pedidos/', payload)
    return data.data || data
  },
  updateEstado: async ({ id, estado }) => {
    const { data } = await apiClient.patch(`/catalog/pedidos/${id}/estado/`, { estado })
    return data.data
  },
  getReportes: async (params = {}) => {
    const { data } = await apiClient.get('/catalog/reportes/', { params })
    return data.data
  },
}
