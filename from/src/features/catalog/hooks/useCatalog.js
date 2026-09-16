import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { catalogApi } from '../api/catalogApi'

export function usePublicCategorias() {
  return useQuery({ queryKey: ['catalog-categorias-public'], queryFn: catalogApi.getPublicCategorias })
}
export function useAdminCategorias() {
  return useQuery({ queryKey: ['catalog-categorias-admin'], queryFn: catalogApi.getAdminCategorias })
}
export function useCategoriaActions() {
  const qc = useQueryClient()
  const refresh = () => qc.invalidateQueries({ queryKey: ['catalog-categorias'] })
  const create = useMutation({ mutationFn: catalogApi.createCategoria, onSuccess: refresh })
  const update = useMutation({ mutationFn: catalogApi.updateCategoria, onSuccess: refresh })
  const remove = useMutation({ mutationFn: catalogApi.deleteCategoria, onSuccess: refresh })
  return { create, update, remove }
}

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
