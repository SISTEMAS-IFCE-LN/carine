import {Link, useLocation, useParams} from 'react-router'
import {useCampusPublicados, useUnidadesPublicados} from '@/hooks/useReferenciasPublicadas'
import {PAGES_ROUTES, rotaListagemPublicados, rotaUnidade} from '@/constants/routes'
import {Breadcrumb} from '@/components/common/Breadcrumb'
import {CardLink} from '@/components/common/CardLink'
import {EstadoVazio} from '@/components/common/EstadoVazio'
import {buttonVariants} from '@/components/ui/button'
import {Loading} from '@/components/ui/Loading'
import {ErrorLista} from '@/components/common/ErrorLista'
import type {CatalogoNavState} from '@/types/ambientes/navegacao'
import {parseIdPositivo} from '@/lib/utils/parse-id'

export function CampusPage() {
    const {campusId} = useParams<{campusId: string}>()
    const location = useLocation()
    const estado = (location.state ?? {}) as CatalogoNavState
    const id = parseIdPositivo(campusId)

    const {data: campi = []} = useCampusPublicados({enabled: id !== null})
    const {data: unidades = [], isLoading, error, refetch} =
        useUnidadesPublicados(id)

    const nomeCampus = estado.campus?.nome ?? campi.find((c) => c.id === id)?.nome ?? 'Campus'
    const trilhos = [{nome: nomeCampus}]

    if (id === null) {
        return (
            <div className="space-y-4">
                <Breadcrumb trilhos={[{nome: 'Campus não encontrado'}]}/>
                <EstadoVazio
                    mensagem="Campus não encontrado."
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
                <h1 className="text-2xl font-bold">{nomeCampus}</h1>
                <Link
                    to={rotaListagemPublicados({campusId: id})}
                    className={buttonVariants({variant: 'outline'})}
                >
                    Ver todos os ambientes do campus
                </Link>
            </div>

            {unidades.length === 0 ? (
                <EstadoVazio
                    mensagem="Nenhuma unidade com ambientes publicados neste campus."
                    acao={{rotulo: 'Voltar à home', para: PAGES_ROUTES.HOME}}
                />
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {unidades.map((unidade) => (
                        <CardLink
                            key={unidade.id}
                            to={rotaUnidade(unidade.id)}
                            state={{campus: {id, nome: nomeCampus}, unidade}}
                            ariaLabel={`Abrir unidade ${unidade.nome}`}
                            titulo={unidade.nome}
                            descricao="Ver blocos"
                        />
                    ))}
                </div>
            )}
        </section>
    )
}
