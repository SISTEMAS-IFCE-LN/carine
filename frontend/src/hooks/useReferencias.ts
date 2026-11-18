import {useQuery} from '@tanstack/react-query'
import {
    fetchBlocos,
    fetchCampus,
    fetchUnidades,
} from '@/lib/api/api-referencia'

interface OpcoesQuery {
    enabled?: boolean
}

export function useCampus(options: OpcoesQuery = {}) {
    return useQuery({
        queryKey: ['referencias', 'campus'],
        queryFn: ({signal}) => fetchCampus(signal),
        enabled: options.enabled ?? true,
    })
}

export function useUnidades(campusId: number | null, options: OpcoesQuery = {}) {
    return useQuery({
        queryKey: ['referencias', 'unidades', campusId],
        queryFn: ({signal}) => fetchUnidades(campusId!, signal),
        enabled: (options.enabled ?? true) && campusId !== null,
    })
}

export function useBlocos(unidadeId: number | null, options: OpcoesQuery = {}) {
    return useQuery({
        queryKey: ['referencias', 'blocos', unidadeId],
        queryFn: ({signal}) => fetchBlocos(unidadeId!, signal),
        enabled: (options.enabled ?? true) && unidadeId !== null,
    })
}
