import type {TipoFiltro} from '@/types/ambientes/enums'
import type {Filtros} from '@/types/ambientes/filtros'

// Query parameters para listagem de ambientes
export interface AmbientesQuery {
    page?: number
    size?: number
    nome?: string
    campusId?: number
    unidadeId?: number
    blocoId?: number
    andar?: number
    tipo?: string
    tipoFiltro: TipoFiltro
}

// Query parameters para UC20-FE
export interface EsquadriasQuery {
    ids: number[]
    page?: number
    size?: number
}

/** Converte os filtros da URL na query da API, omitindo campos vazios. */
export function paraAmbientesQuery(
    filtros: Filtros,
    page: number,
    size: number,
    tipoFiltro: TipoFiltro,
): AmbientesQuery {
    return {
        page,
        size,
        nome: filtros.nome || undefined,
        campusId: filtros.campusId ?? undefined,
        unidadeId: filtros.unidadeId ?? undefined,
        blocoId: filtros.blocoId ?? undefined,
        andar: filtros.andar ?? undefined,
        tipo: filtros.tipo || undefined,
        tipoFiltro,
    }
}
