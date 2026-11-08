import { useInfiniteQuery, useQuery } from '@tanstack/react-query'

const defaults = {
    staleTime: 30000,
    retry: (count, error) => ![400, 401, 403, 404].includes(error.response?.status) && count < 1,
}

export default function useAuthFetch(queryKey, queryFn, options = {}) {
    return useQuery({
        queryKey,
        queryFn,
        ...defaults,
        ...options,
    })
}

export function useAuthInfiniteFetch(queryKey, queryFn, options) {
    return useInfiniteQuery({ queryKey, queryFn, ...defaults, ...options })
}
