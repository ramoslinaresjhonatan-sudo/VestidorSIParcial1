import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { accessApi } from '../api/accessApi'

export function useRoles() {
  return useQuery({ queryKey: ['roles'], queryFn: accessApi.getRoles })
}

export function usePermissions() {
  return useQuery({ queryKey: ['permissions'], queryFn: accessApi.getPermissions })
}

export function useAccessOptions() {
  return useQuery({ queryKey: ['access-options'], queryFn: accessApi.getOptions })
}

export function useRoleActions() {
  const queryClient = useQueryClient()
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['roles'] })
    queryClient.invalidateQueries({ queryKey: ['access-options'] })
    queryClient.invalidateQueries({ queryKey: ['users'] })
  }
  const create = useMutation({ mutationFn: accessApi.createRole, onSuccess: refresh })
  const update = useMutation({ mutationFn: accessApi.updateRole, onSuccess: refresh })
  return { create, update }
}
