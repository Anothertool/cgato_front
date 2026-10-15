import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toaster } from '../components/ui/toaster'

export default function useAuthMutate({
    mutationFn,
    invalidateKeys = [],
    successMessage = 'Cambios guardados',
    onSuccess,
    ...options
}) {
    const queryClient = useQueryClient()
    return useMutation({
        ...options,
        mutationFn,
        onSuccess: async (data, variables) => {
            await Promise.all(
                invalidateKeys.map((queryKey) => queryClient.invalidateQueries({ queryKey })),
            )
            toaster.create({ title: successMessage, type: 'success' })
            onSuccess?.(data, variables)
        },
        onError: (error) => {
            toaster.create({
                title: 'No se pudo completar la operación',
                description: error.userMessage,
                type: 'error',
            })
            options.onError?.(error)
        },
    })
}
