import { useQuery } from '@tanstack/react-query'
import { authApi } from '../api/authApi'
import { getStoredUser } from '@/utils/authSession'

export function useCurrentUser() {
  const stored = getStoredUser()
  return useQuery({
    queryKey: ['current-user', stored.id],
    queryFn: authApi.getCurrentUser,
    enabled: Boolean(stored.id),
    retry: false,
  })
}
