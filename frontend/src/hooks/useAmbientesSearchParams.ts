import { useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { type Filtros, FiltrosUrlSchema, FILTROS_VAZIOS, derivarTipoFiltro } from '@/types/ambientes/filtros'
import { chaveTipoAmbiente, TipoFiltro } from '@/types/ambientes/enums'
import { usePaginationParams } from '@/hooks/usePaginationParams'
import { useFiltroLocal } from '@/hooks/useFiltroLocal'

export interface AmbientesSearchParams {
    page: number
    size: number
    filtros: Filtros
    filtrosLocal: Filtros
    setFiltrosLocal: (f: Filtros) => void
    handleFiltrosChange: (f: Filtros) => void
    handlePageChange: (page: number) => void
    handleSizeChange: (size: string | null) => void
    tipoFiltro: TipoFiltro
}

// Acoplamento: filho só existe com o pai.
export function useAmbientesSearchParams(): AmbientesSearchParams {
    const [searchParams] = useSearchParams()
    const { page, size, handlePageChange, handleSizeChange, updateSearchParams } = usePaginationParams()

    // Validar filtros da URL com Zod (page/size já são de usePaginationParams)
    const filtros = useMemo<Filtros>(() => {
        const result = FiltrosUrlSchema.safeParse({
            nome: searchParams.get('nome'),
            campusId: searchParams.get('campusId'),
            unidadeId: searchParams.get('unidadeId'),
            blocoId: searchParams.get('blocoId'),
            andar: searchParams.get('andar'),
            tipo: searchParams.get('tipo'),
        })
        if (!result.success) return FILTROS_VAZIOS
        return {...result.data, tipo: chaveTipoAmbiente(result.data.tipo)}
    }, [searchParams])

    // Rascunho local sincronizado com a URL (back/forward) — delegado a useFiltroLocal
    const { local: filtrosLocal, setLocal: setFiltrosLocal } = useFiltroLocal<Filtros>(filtros)

    function handleFiltrosChange(novosFiltros: Filtros) {
        // idempotente: chave técnica continua chave; rótulo/variação vira chave
        const filtros = {...novosFiltros, tipo: chaveTipoAmbiente(novosFiltros.tipo)}
        setFiltrosLocal(filtros)
        updateSearchParams({
            nome: filtros.nome || null,
            campusId: filtros.campusId,
            unidadeId: filtros.unidadeId,
            blocoId: filtros.blocoId,
            andar: filtros.andar,
            tipo: filtros.tipo || null,
            page: 0, // resetar página ao aplicar filtros
        })
    }

    // Derivar tipoFiltro a partir dos filtros ativos
    const tipoFiltro = useMemo<TipoFiltro>(() => derivarTipoFiltro(filtros), [filtros])

    return {
        page,
        size,
        filtros,
        filtrosLocal,
        setFiltrosLocal,
        handleFiltrosChange,
        handlePageChange,
        handleSizeChange,
        tipoFiltro,
    }
}
