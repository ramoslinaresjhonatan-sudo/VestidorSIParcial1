import { apiClient } from '@/lib/axios/apiClient'

export const cartApi = {
  getCart: async () => {
    const { data } = await apiClient.get('/cart/')
    return data.data
  },
  addItem: async ({ producto_id, talla, color, cantidad }) => {
    const { data } = await apiClient.post('/cart/items/', { producto_id, talla, color, cantidad })
    return data.data
  },
  updateItem: async ({ id, payload }) => {
    const { data } = await apiClient.patch(`/cart/items/${id}/`, payload)
    return data.data
  },
  removeItem: async (id) => {
    const { data } = await apiClient.delete(`/cart/items/${id}/`)
    return data.data
  },
  applyCoupon: async (codigo) => {
    const { data } = await apiClient.post('/cart/coupon/', { codigo })
    return data.data
  },
  removeCoupon: async () => {
    const { data } = await apiClient.delete('/cart/coupon/')
    return data.data
  },
}
