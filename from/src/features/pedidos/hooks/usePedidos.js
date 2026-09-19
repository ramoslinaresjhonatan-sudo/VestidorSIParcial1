import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { pedidosApi } from '../api/pedidosApi'

export function usePedidos(params = {}) {
  return useQuery({ queryKey: ['pedidos', params], queryFn: () => pedidosApi.list(params) })
}
export function useCrearPedido() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: pedidosApi.create, onSuccess: () => qc.invalidateQueries({ queryKey: ['pedidos'] }) })
}
export function useActualizarPedido() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: pedidosApi.updateEstado, onSuccess: () => qc.invalidateQueries({ queryKey: ['pedidos'] }) })
}
export function useReportes(params = {}) {
  return useQuery({ queryKey: ['reportes', params], queryFn: () => pedidosApi.getReportes(params) })
}
