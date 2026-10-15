import useAuthMutate from './useAuthMutate'

export default function useAuthDelete(options) {
    return useAuthMutate({ successMessage: 'Registro eliminado', ...options })
}
