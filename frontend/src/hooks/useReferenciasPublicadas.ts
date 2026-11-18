import {useQuery} from '@tanstack/react-query'
import {
    fetchBlocosPublicados,
    fetchCampusPublicados,
    fetchUnidadesPublicados,
} from '@/lib/api/api-publicados'

export const REFERENCIAS_PUBLICADAS_QUERY_KEY = ['referencias-publicados'] as const

interface OpcoesQuery {
    enabled?: boolean
}

export function useCampusPublicados(options: OpcoesQuery = {}) {
    return useQuery({
        queryKey: [...REFERENCIAS_PUBLICADAS_QUERY_KEY, 'campus'],
        queryFn: ({signal}) => fetchCampusPublicados(signal),
        staleTime: 30_000,
        enabled: options.enabled ?? true,
    })
}

export function useUnidadesPublicados(campusId: number | null, options: OpcoesQuery = {}) {
    return useQuery({
        queryKey: [...REFERENCIAS_PUBLICADAS_QUERY_KEY, 'unidades', campusId],
        queryFn: ({signal}) => fetchUnidadesPublicados(campusId!, signal),
        staleTime: 30_000,
        enabled: (options.enabled ?? true) && campusId !== null,
    })
}

export function useBlocosPublicados(unidadeId: number | null, options: OpcoesQuery = {}) {
    return useQuery({
        queryKey: [...REFERENCIAS_PUBLICADAS_QUERY_KEY, 'blocos', unidadeId],
        queryFn: ({signal}) => fetchBlocosPublicados(unidadeId!, signal),
        staleTime: 30_000,
        enabled: (options.enabled ?? true) && unidadeId !== null,
    })
}
