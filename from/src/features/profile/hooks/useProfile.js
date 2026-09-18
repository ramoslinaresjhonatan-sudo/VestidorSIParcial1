import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { profileApi } from '../api/profileApi'
import { clearPendingProfile, getPendingProfile, hasPendingProfile, savePendingProfile } from '../utils/offlineSync'

export function useProfile() {
  return useQuery({
    queryKey: ['profile', 'me'],
    queryFn: profileApi.getMe,
    retry: false,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload) => {
      // Sin conexión -> guarda localmente
      if (!navigator.onLine) {
        savePendingProfile(payload)
        throw new Error('OFFLINE_SAVED')
      }
      return profileApi.updateMe(payload)
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['profile', 'me'], data)
      queryClient.invalidateQueries({ queryKey: ['current-user'] })
      clearPendingProfile()
    },
  })
}

export function useOfflineSync() {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: profileApi.updateMe,
    onSuccess: (data) => {
      queryClient.setQueryData(['profile', 'me'], data)
      clearPendingProfile()
    },
  })

  const syncIfNeeded = async () => {
    if (hasPendingProfile() && navigator.onLine) {
      const pending = getPendingProfile()
      if (pending?.payload) {
        try {
          await mutation.mutateAsync(pending.payload)
          return true
        } catch {
          return false
        }
      }
    }
    return false
  }

  return { syncIfNeeded, isSyncing: mutation.isPending, pending: getPendingProfile() }
}
