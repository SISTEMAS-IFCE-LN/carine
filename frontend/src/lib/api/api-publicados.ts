import {
    type AmbienteDetalhe,
    type AmbientesBasicosPaginados,
} from '@/types/ambientes/response'
import type {AmbientesQuery, EsquadriasQuery} from '@/types/ambientes/query'
import type {EsquadriasResponse} from '@/types/ambientes/esquadrias'
import {ReferenciaListSchema, type ReferenciaRes} from '@/types/ambientes/referencia'
import {API_ROUTES} from '@/constants/routes'
import {api} from '@/lib/api/api'
import {fetchAmbientes, fetchDetalheAmbiente, fetchEsquadriasAmbientes} from '@/lib/api/api-ambientes'

export function fetchPublicados(
    query: AmbientesQuery,
    signal?: AbortSignal
): Promise<AmbientesBasicosPaginados> {
    return fetchAmbientes(query, API_ROUTES.PUBLICADOS, signal)
}

export function fetchDetalhePublicados(
    id: number,
    signal?: AbortSignal
): Promise<AmbienteDetalhe> {
    return fetchDetalheAmbiente(id, API_ROUTES.PUBLICADOS, signal)
}

export function fetchEsquadriasPublicados(
    query: EsquadriasQuery,
    signal?: AbortSignal
): Promise<EsquadriasResponse> {
    return fetchEsquadriasAmbientes(query, API_ROUTES.PUBLICADOS, signal)
}

export async function fetchCampusPublicados(signal?: AbortSignal): Promise<ReferenciaRes[]> {
    const {data} = await api.get(API_ROUTES.PUBLICADO_CAMPUS, {signal})
    return ReferenciaListSchema.parse(data)
}

export async function fetchUnidadesPublicados(
    campusId: number,
    signal?: AbortSignal,
): Promise<ReferenciaRes[]> {
    const {data} = await api.get(API_ROUTES.PUBLICADO_UNIDADES, {
        params: {campusId},
        signal,
    })
    return ReferenciaListSchema.parse(data)
}

export async function fetchBlocosPublicados(
    unidadeId: number,
    signal?: AbortSignal,
): Promise<ReferenciaRes[]> {
    const {data} = await api.get(API_ROUTES.PUBLICADO_BLOCOS, {
        params: {unidadeId},
        signal,
    })
    return ReferenciaListSchema.parse(data)
}
