import {Link, useLocation, useParams} from 'react-router'
import {useBlocosPublicados} from '@/hooks/useReferenciasPublicadas'
import {PAGES_ROUTES, rotaBloco, rotaCampus, rotaListagemPublicados} from '@/constants/routes'
import {Breadcrumb, type TrilhoBreadcrumb} from '@/components/common/Breadcrumb'
import {CardLink} from '@/components/common/CardLink'
import {EstadoVazio} from '@/components/common/EstadoVazio'
import {buttonVariants} from '@/components/ui/button'
import {Loading} from '@/components/ui/Loading'
import {ErrorLista} from '@/components/common/ErrorLista'
import type {CatalogoNavState} from '@/types/ambientes/navegacao'

export function UnidadePage() {
    const {unidadeId} = useParams<{unidadeId: string}>()
    const location = useLocation()
    const estado = (location.state ?? {}) as CatalogoNavState
    const id = Number(unidadeId)
    const idValido = Number.isInteger(id) && id > 0

    const {data: blocos = [], isLoading, error, refetch} =
        useBlocosPublicados(idValido ? id : null)

    const trilhos: TrilhoBreadcrumb[] = [
        ...(estado.campus
            ? [{nome: estado.campus.nome, href: rotaCampus(estado.campus.id)}]
            : [{nome: 'Campus'}]),
        {nome: estado.unidade?.nome ?? 'Unidade'},
    ]

    if (!idValido) {
        return (
            <div className="space-y-4">
                <Breadcrumb trilhos={[{nome: 'Unidade não encontrada'}]}/>
                <EstadoVazio
                    mensagem="Unidade não encontrada."
                    acao={{rotulo: 'Voltar à home', para: PAGES_ROUTES.HOME}}
                />
            </div>
        )
    }

    if (isLoading) return <Loading/>
    if (error) {
        return (
            <div className="space-y-4">
                <Breadcrumb trilhos={trilhos}/>
                <ErrorLista onTentarNovamente={() => void refetch()}/>
            </div>
        )
    }

    return (
        <section className="space-y-6">
            <Breadcrumb trilhos={trilhos}/>
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h1 className="text-2xl font-bold">{estado.unidade?.nome ?? 'Unidade'}</h1>
                <Link
                    to={rotaListagemPublicados({campusId: estado.campus?.id, unidadeId: id})}
                    className={buttonVariants({variant: 'outline'})}
                >
                    Ver todos os ambientes da unidade
                </Link>
            </div>

            {blocos.length === 0 ? (
                <EstadoVazio
                    mensagem="Nenhum bloco com ambientes publicados nesta unidade."
                    acao={{
                        rotulo: 'Voltar ao campus',
                        para: estado.campus ? rotaCampus(estado.campus.id) : PAGES_ROUTES.HOME,
                    }}
                />
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {blocos.map((bloco) => (
                        <CardLink
                            key={bloco.id}
                            to={rotaBloco(bloco.id)}
                            state={{campus: estado.campus, unidade: estado.unidade}}
                            ariaLabel={`Abrir bloco ${bloco.nome}`}
                            titulo={bloco.nome}
                            descricao="Ver resumo do bloco"
                        />
                    ))}
                </div>
            )}
        </section>
    )
}
