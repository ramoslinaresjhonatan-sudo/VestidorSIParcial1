import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { catalogApi } from '../api/catalogApi'

export function usePublicProducts(params) {
  return useQuery({
    queryKey: ['catalog-public', params],
    queryFn: () => catalogApi.getPublicProducts(params),
  })
}

export function useAdminProducts() {
  return useQuery({
    queryKey: ['catalog-admin'],
    queryFn: catalogApi.getAdminProducts,
  })
}

export function useCatalogActions() {
  const qc = useQueryClient()
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['catalog-public'] })
    qc.invalidateQueries({ queryKey: ['catalog-admin'] })
  }
  const create = useMutation({ mutationFn: catalogApi.createProduct, onSuccess: refresh })
  const update = useMutation({ mutationFn: catalogApi.updateProduct, onSuccess: refresh })
  const remove = useMutation({ mutationFn: catalogApi.deleteProduct, onSuccess: refresh })
  return { create, update, remove }
}
