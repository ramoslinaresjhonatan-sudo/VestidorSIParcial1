import { apiClient } from '@/lib/axios/apiClient'

export const tryonApi = {
  guardar: async ({ producto_id, talla, color, captura_base64, captura }) => {
    if (captura instanceof File) {
      const fd = new FormData()
      fd.append('producto_id', producto_id)
      if (talla) fd.append('talla', talla)
      if (color) fd.append('color', color)
      fd.append('captura', captura)
      const { data } = await apiClient.post('/tryon/guardar/', fd)
      return data.data || data
    }
    const { data } = await apiClient.post('/tryon/guardar/', { producto_id, talla, color, captura_base64 })
    return data.data || data
  },
  misPruebas: async () => {
    const { data } = await apiClient.get('/tryon/mis-pruebas/')
    return data.data
  },
}
