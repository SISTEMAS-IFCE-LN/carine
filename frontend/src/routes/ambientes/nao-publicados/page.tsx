import {useMemo, useState} from 'react'
import {useQuery, useQueryClient} from '@tanstack/react-query'
import {useNavigate} from 'react-router'
import {deletarAmbientes, enviarParaValidacao, fetchNaoPublicados} from '@/lib/api/api-naopublicados'
import {type AmbientesQuery, paraAmbientesQuery} from '@/types/ambientes/query'
import {PAGES_ROUTES} from '@/constants/routes'
import {PesquisaBarAmbientes} from '@/components/ambientes/PesquisaBarAmbientes'
import {TabelaPadrao} from '@/components/ambientes/TabelaPadrao'
import {type AcaoLote, AcoesLote} from '@/components/ambientes/AcoesLote'
import {ErrorLista} from '@/components/common/ErrorLista'
import {EstadoVazio} from '@/components/common/EstadoVazio'
import {PaginacaoFooter} from '@/components/ambientes/PaginacaoFooter'
import {ModalConfirmacao} from '@/components/ambientes/ModalConfirmacao'
import {PermissionButton} from '@/components/auth/PermissionButton'
import {Role} from '@/types/usuarios/user'
import {useAmbientesSearchParams} from '@/hooks/useAmbientesSearchParams'
import {useSelecaoAmbientes} from '@/hooks/useSelecaoAmbientes'
import {toast} from 'sonner'
import {invalidarReferenciasPublicadas} from '@/hooks/useReferenciasPublicadas'

export function NaoPublicadosPage() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()

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
        queryKey: ['ambientes', 'nao-publicados', query],
        queryFn: ({signal}) => fetchNaoPublicados(query, signal),
    })

    const idsDaPagina = useMemo(() => (data ? data.ambientes.map((a) => a.id) : []), [data])
    const selecao = useSelecaoAmbientes(idsDaPagina)

    const [modalLote, setModalLote] = useState<null | 'validar' | 'deletar'>(null)

    const acoesLote: AcaoLote[] = [
        {value: 'Enviar p/ Validação', onRun: () => setModalLote('validar')},
        {value: 'Deletar', onRun: () => setModalLote('deletar')},
    ]

    async function confirmarLote() {
        const ids = selecao.selectedIds
        if (modalLote === 'validar') await enviarParaValidacao(ids)
        else if (modalLote === 'deletar') {
            await deletarAmbientes(ids)
            // A exclusão pode remover bloco/unidade/campus órfãos (RN-1.19).
            invalidarReferenciasPublicadas(queryClient)
        }
        toast.success('Operação concluída.')
        selecao.limparSelecao()
        void queryClient.invalidateQueries({queryKey: ['ambientes', 'nao-publicados']})
    }

    if (error) {
        return (
            <div className="space-y-4">
                <h1 className="text-2xl font-bold">Não Publicados</h1>
                <ErrorLista onTentarNovamente={() => refetch()}/>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Gestão de Ambientes</h1>
                <PermissionButton requiredRoles={[Role.GESTOR_SISTEMA]}
                                  onClick={() => navigate('/ambientes/nao-publicados/novo')}>
                    Criar Novo
                </PermissionButton>
            </div>
            <PesquisaBarAmbientes
                initial={filtrosLocal}
                onChange={(novosFiltros) => {
                    selecao.limparSelecao()
                    handleFiltrosChange(novosFiltros)
                }}
                fonte="gerais"
            />
            {isLoading ? (
                <p role="status">Carregando…</p>
            ) : data && data.ambientes.length > 0 ? (
                <>
                    <AcoesLote
                        selectedIds={selecao.selectedIds}
                        onClear={selecao.limparSelecao}
                        acoes={acoesLote}
                    />
                    <TabelaPadrao
                        itens={data.ambientes}
                        detalheBasePath={PAGES_ROUTES.NAO_PUBLICADOS}
                        selectedIds={selecao.selectedIds}
                        onToggleSelect={selecao.toggleSelect}
                        onToggleSelectAll={selecao.toggleSelectAll}
                        allSelected={selecao.allSelected}
                        someSelected={selecao.someSelected}
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
                <EstadoVazio mensagem="Nenhum ambiente não publicado."/>
            )}
            <ModalConfirmacao
                open={modalLote !== null}
                title={modalLote === 'deletar' ? 'Deletar ambientes selecionados?' : 'Enviar para validação?'}
                description={modalLote === 'deletar'
                    ? 'Esta ação é permanente.'
                    : 'Os ambientes passarão a aguardar validação.'}
                onConfirm={confirmarLote}
                onOpenChange={(o) => !o && setModalLote(null)}
                variant={modalLote === 'deletar' ? 'destructive' : 'default'}
            />
        </div>
    )
}