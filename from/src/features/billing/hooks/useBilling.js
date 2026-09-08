import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { billingApi } from '../api/billingApi'

export function usePublicPlans() {
  return useQuery({
    queryKey: ['public-plans'],
    queryFn: billingApi.getPublicPlans,
  })
}

export function useAdminPlans() {
  return useQuery({
    queryKey: ['admin-plans'],
    queryFn: billingApi.getAdminPlans,
  })
}

export function usePlanActions() {
  const queryClient = useQueryClient()
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-plans'] })
    queryClient.invalidateQueries({ queryKey: ['public-plans'] })
  }

  const create = useMutation({ mutationFn: billingApi.createPlan, onSuccess: refresh })
  const update = useMutation({ mutationFn: billingApi.updatePlan, onSuccess: refresh })
  const remove = useMutation({ mutationFn: billingApi.deletePlan, onSuccess: refresh })

  return { create, update, remove }
}

export function useCreateCheckout() {
  return useMutation({ mutationFn: billingApi.createCheckout })
}

export function useCheckoutStatus(sessionId) {
  return useQuery({
    queryKey: ['checkout-status', sessionId],
    queryFn: () => billingApi.getCheckout(sessionId),
    enabled: Boolean(sessionId),
    retry: 1,
  })
}
