import { apiClient } from '@/lib/axios/apiClient'

function toFormData(payload) {
  const fd = new FormData()
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    // imagen is File
    fd.append(key, value)
  })
  return fd
}

export const catalogApi = {
  // Categorías (tabla aparte niña/adolescente/adulta)
  getPublicCategorias: async () => {
    const { data } = await apiClient.get('/catalog/categorias/')
    return data.data
  },
  getAdminCategorias: async () => {
    const { data } = await apiClient.get('/catalog/admin/categorias/')
    return data.data
  },
  createCategoria: async (payload) => {
    const { data } = await apiClient.post('/catalog/admin/categorias/', payload)
    return data.data
  },
  updateCategoria: async ({ id, payload }) => {
    const { data } = await apiClient.patch(`/catalog/admin/categorias/${id}/`, payload)
    return data.data
  },
  deleteCategoria: async (id) => {
    const { data } = await apiClient.delete(`/catalog/admin/categorias/${id}/`)
    return data
  },
  getPublicProducts: async (params = {}) => {
    const { data } = await apiClient.get('/catalog/products/', { params })
    return data.data
  },
  getPublicProduct: async (id) => {
    const { data } = await apiClient.get(`/catalog/products/${id}/`)
    return data.data
  },
  getAdminProducts: async () => {
    const { data } = await apiClient.get('/catalog/admin/products/')
    return data.data
  },
  getAdminProduct: async (id) => {
    const { data } = await apiClient.get(`/catalog/admin/products/${id}/`)
    return data.data
  },
  createProduct: async (payload) => {
    const isForm = payload instanceof FormData
    const body = isForm ? payload : toFormData(payload)
    const { data } = await apiClient.post('/catalog/admin/products/', body, {
      headers: isForm ? {} : { 'Content-Type': 'multipart/form-data' },
    })
    return data.data
  },
  updateProduct: async ({ id, payload }) => {
    const isForm = payload instanceof FormData
    const body = isForm ? payload : toFormData(payload)
    const { data } = await apiClient.patch(`/catalog/admin/products/${id}/`, body, {
      headers: isForm ? {} : { 'Content-Type': 'multipart/form-data' },
    })
    return data.data
  },
  deleteProduct: async (id) => {
    const { data } = await apiClient.delete(`/catalog/admin/products/${id}/`)
    return data
  },
}
