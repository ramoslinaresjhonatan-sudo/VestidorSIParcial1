import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '../api/usersApi'

export function useUsers(page = 1, pageSize = 20) {
  return useQuery({
    queryKey: ['users', page, pageSize],
    queryFn: () => usersApi.getAll({ page, pageSize }),
  })
}

export function useUserActions() {
  const queryClient = useQueryClient()
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['users'] })

  const create = useMutation({ mutationFn: usersApi.create, onSuccess: refresh })
  const update = useMutation({ mutationFn: usersApi.update, onSuccess: refresh })
  const annul = useMutation({ mutationFn: usersApi.annul, onSuccess: refresh })
  const remove = useMutation({ mutationFn: usersApi.remove, onSuccess: refresh })

  return { create, update, annul, remove }
}
