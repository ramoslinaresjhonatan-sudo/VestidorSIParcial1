import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cartApi } from '../api/cartApi'

export function useCart() {
  return useQuery({
    queryKey: ['cart'],
    queryFn: cartApi.getCart,
    retry: 1,
  })
}

export function useCartActions() {
  const qc = useQueryClient()
  const refresh = () => qc.invalidateQueries({ queryKey: ['cart'] })

  const add = useMutation({
    mutationFn: cartApi.addItem,
    onSuccess: refresh,
  })
  const update = useMutation({
    mutationFn: cartApi.updateItem,
    onSuccess: refresh,
  })
  const remove = useMutation({
    mutationFn: cartApi.removeItem,
    onSuccess: refresh,
  })
  const applyCoupon = useMutation({
    mutationFn: cartApi.applyCoupon,
    onSuccess: refresh,
  })
  const removeCoupon = useMutation({
    mutationFn: cartApi.removeCoupon,
    onSuccess: refresh,
  })

  return { add, update, remove, applyCoupon, removeCoupon }
}
