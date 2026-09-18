import { apiClient } from '@/lib/axios/apiClient'

export const inventoryApi = {
  getInventario: async (params = {}) => {
    const cleaned = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null))
    const { data } = await apiClient.get('/catalog/inventory/', { params: cleaned })
    return data.data
  },
  getSucursales: async () => {
    const { data } = await apiClient.get('/catalog/inventory/sucursales/')
    return data.data
  },
  ajustarStock: async (payload) => {
    const { data } = await apiClient.post('/catalog/inventory/ajustar/', payload)
    return data.data || data
  },
  trasladar: async (payload) => {
    const { data } = await apiClient.post('/catalog/inventory/trasladar/', payload)
    return data.data || data
  },
  registrarMerma: async (payload) => {
    const { data } = await apiClient.post('/catalog/inventory/merma/', payload)
    return data.data || data
  },
  getHistorial: async (params = {}) => {
    const { data } = await apiClient.get('/catalog/inventory/historial/', { params })
    return data.data
  },
}
