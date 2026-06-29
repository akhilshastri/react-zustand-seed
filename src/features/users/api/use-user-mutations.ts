import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { User, UserInput } from '@/domain/user'
import { http } from '@/shared/api'

import { userKeys } from './users-keys'

/** Create a user, then invalidate every users list so the grid refetches (plan §4.2). */
export const useCreateUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UserInput) => http.post<User>('/users', input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  })
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UserInput }) =>
      http.patch<User>(`/users/${id}`, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  })
}

export const useDeleteUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => http.delete<void>(`/users/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  })
}
