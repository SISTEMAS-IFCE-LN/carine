import {useQuery} from '@tanstack/react-query'
import {useEffect, useMemo} from 'react'
import {fetchPublicados} from '@/lib/api/api-publicados'
import {type AmbientesQuery, paraAmbientesQuery} from '@/types/ambientes/query'
import {PesquisaBarAmbientes} from '@/components/ambientes/PesquisaBarAmbientes'
import {TabelaPadrao} from '@/components/ambientes/TabelaPadrao'
import {AcoesLote} from '@/components/ambientes/AcoesLote'
import {ErrorLista} from '@/components/common/ErrorLista'
import {EstadoVazio} from '@/components/common/EstadoVazio'
import {PaginacaoFooter} from '@/components/ambientes/PaginacaoFooter'
import {Button} from '@/components/ui/button'
import {PAGES_ROUTES} from '@/constants/routes'
import {toast} from 'sonner'
import {useAmbientesSearchParams} from '@/hooks/useAmbientesSearchParams'
import {useSelecaoAmbientes} from '@/hooks/useSelecaoAmbientes'
import {useAuth} from '@/hooks/useAuth'
import {useVoltar} from '@/hooks/useVoltar'

export function PublicadosPage() {
    const {user} = useAuth()
    const autenticado = user !== null
    const voltar = useVoltar(PAGES_ROUTES.HOME)

    const {
        page,
        size,
        filtros,
        filtrosLocal,
        handleFiltrosChange,
        handlePageChange,
        handleSizeChange,
        tipoFiltro,
    } = useAmbientesSearchParams()

    const query: AmbientesQuery = paraAmbientesQuery(filtros, page, size, tipoFiltro)

    const {data, isLoading, error, refetch} = useQuery({
        queryKey: ['ambientes', 'publicados', query],
        queryFn: ({signal}) => fetchPublicados(query, signal),
    })

    // Seleção múltipla por página visível (UC20-FE). Só para usuários autenticados:
    // anônimos veem a lista sem checkboxes (gate via `ativa` do hook).
    const idsDaPagina = useMemo(
        () => (data ? data.ambientes.map((a) => a.id) : []),
        [data],
    )
    const selecao = useSelecaoAmbientes(idsDaPagina, {ativa: autenticado})

    useEffect(() => {
        if (error) {
            toast.error('Erro ao carregar ambientes. Tente novamente.')
        }
    }, [error])

    if (error) {
        return (
            <div className="space-y-4">
                <ErrorLista onTentarNovamente={() => refetch()}/>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div>
                <Button variant="outline" onClick={voltar}>
                    Voltar
                </Button>
            </div>
            <PesquisaBarAmbientes
                initial={filtrosLocal}
                onChange={(novosFiltros) => {
                    selecao.limparSelecao()
                    handleFiltrosChange(novosFiltros)
                }}
                fonte="publicados"
            />
            {isLoading ? (
                <p role="status">Carregando…</p>
            ) : data && data.ambientes.length > 0 ? (
                <>
                    {autenticado && (
                        <AcoesLote
                            selectedIds={selecao.selectedIds}
                            onClear={selecao.limparSelecao}
                        />
                    )}
                    <TabelaPadrao
                        itens={data.ambientes}
                        selectedIds={autenticado ? selecao.selectedIds : undefined}
                        onToggleSelect={autenticado ? selecao.toggleSelect : undefined}
                        onToggleSelectAll={autenticado ? selecao.toggleSelectAll : undefined}
                        allSelected={autenticado ? selecao.allSelected : undefined}
                        someSelected={autenticado ? selecao.someSelected : undefined}
                    />
                    <PaginacaoFooter
                        page={page}
                        size={size}
                        areaTotal={data.areaTotal}
                        hasPrevious={data.dadosPaginacao.hasPrevious}
                        hasNext={data.dadosPaginacao.hasNext}
                        currentPage={data.dadosPaginacao.currentPage}
                        totalPages={data.dadosPaginacao.totalPages}
                        onPageChange={(novaPagina) => {
                            selecao.limparSelecao()
                            handlePageChange(novaPagina)
                        }}
                        onSizeChange={(novoSize) => {
                            selecao.limparSelecao()
                            handleSizeChange(novoSize)
                        }}
                    />
                </>
            ) : (
                <EstadoVazio mensagem="Nenhum ambiente encontrado."/>
            )}
        </div>
    )
}
