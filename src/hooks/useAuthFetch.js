import { useQuery } from '@tanstack/react-query'

export default function useAuthFetch(queryKey, queryFn, options = {}) {
    return useQuery({
        queryKey,
        queryFn,
        staleTime: 30000,
        retry: (count, error) =>
            ![400, 401, 403, 404].includes(error.response?.status) && count < 1,
        ...options,
    })
}
