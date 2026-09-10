import { apiClient } from '@/lib/axios/apiClient'

export const billingApi = {
  getPublicPlans: async () => {
    const { data } = await apiClient.get('/billing/plans/')
    return data.data
  },
  getAdminPlans: async () => {
    const { data } = await apiClient.get('/billing/admin/plans/')
    return data.data
  },
  createPlan: async (payload) => {
    const { data } = await apiClient.post('/billing/admin/plans/', payload)
    return data.data
  },
  updatePlan: async ({ id, payload }) => {
    const { data } = await apiClient.patch(`/billing/admin/plans/${id}/`, payload)
    return data.data
  },
  deletePlan: async (id) => {
    const { data } = await apiClient.delete(`/billing/admin/plans/${id}/`)
    return data
  },
  createCheckout: async (planCode) => {
    const { data } = await apiClient.post('/billing/checkout-sessions/', {
      plan_code: planCode,
    })
    return data.data
  },
  getCheckout: async (sessionId) => {
    const { data } = await apiClient.get(`/billing/checkout-sessions/${sessionId}/`)
    return data.data
  },
}
