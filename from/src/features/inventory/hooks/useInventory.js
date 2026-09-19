import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { inventoryApi } from '../api/inventoryApi'
import { pushQueue } from '../utils/offlineQueue'

export function useInventario(params) {
  const skip = params?._skip
  return useQuery({ queryKey: ['inventario', params], queryFn: () => inventoryApi.getInventario(params), enabled: !skip })
}
export function useSucursales() {
  return useQuery({ queryKey: ['inventario-sucursales'], queryFn: inventoryApi.getSucursales, staleTime: 5*60*1000 })
}
export function useHistorial(params) {
  const skip = params?._skip
  return useQuery({ queryKey: ['inventario-historial', params], queryFn: () => inventoryApi.getHistorial(params), enabled: !skip })
}
export function useAlertas() {
  return useQuery({ queryKey: ['inventario-alertas'], queryFn: inventoryApi.getAlertas })
}
function offlineWrap(mutationFn) {
  return async (payload) => {
    if (!navigator.onLine) {
      throw new Error('OFFLINE')
    }
    return mutationFn(payload)
  }
}
export function useAjustarStock() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: offlineWrap(inventoryApi.ajustarStock),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inventario'] }),
    onError: (err, vars) => {
      if (err.message === 'OFFLINE') pushQueue({ type: 'ajustar', payload: vars })
    },
  })
}
export function useTrasladar() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: offlineWrap(inventoryApi.trasladar),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inventario'] }),
    onError: (err, vars) => { if (err.message === 'OFFLINE') pushQueue({ type: 'trasladar', payload: vars }) },
  })
}
export function useMerma() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: offlineWrap(inventoryApi.registrarMerma),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inventario'] }),
    onError: (err, vars) => { if (err.message === 'OFFLINE') pushQueue({ type: 'merma', payload: vars }) },
  })
}
