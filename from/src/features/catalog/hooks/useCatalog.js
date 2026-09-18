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

export function useFilterOptions() {
  return useQuery({
    queryKey: ['catalog-filter-options'],
    queryFn: catalogApi.getFilterOptions,
    staleTime: 5 * 60 * 1000,
  })
}

export function useProductDetail(id) {
  return useQuery({
    queryKey: ['catalog-detail', id],
    queryFn: () => catalogApi.getPublicProduct(id),
    enabled: Boolean(id),
  })
}

export function useOpiniones(id) {
  return useQuery({
    queryKey: ['catalog-opiniones', id],
    queryFn: () => catalogApi.getOpiniones(id),
    enabled: Boolean(id),
  })
}

export function useAddOpinion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: catalogApi.addOpinion,
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['catalog-detail', vars.id] })
      qc.invalidateQueries({ queryKey: ['catalog-opiniones', vars.id] })
    },
  })
}

export function useNotifyStock() {
  return useMutation({ mutationFn: catalogApi.notifyStock })
}

export function useDisponibilidad(id, params) {
  return useQuery({
    queryKey: ['catalog-disponibilidad', id, params],
    queryFn: () => catalogApi.getDisponibilidad({ id, params }),
    enabled: Boolean(id),
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
