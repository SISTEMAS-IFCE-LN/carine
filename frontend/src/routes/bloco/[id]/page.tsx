import {isAxiosError} from 'axios'
import {Link, useLocation, useParams} from 'react-router'
import {useBlocoResumo} from '@/hooks/useReferenciasPublicadas'
import {PAGES_ROUTES, rotaCampus, rotaListagemPublicados, rotaUnidade} from '@/constants/routes'
import {Breadcrumb, type TrilhoBreadcrumb} from '@/components/common/Breadcrumb'
import {CardLink} from '@/components/common/CardLink'
import {EstadoVazio} from '@/components/common/EstadoVazio'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {buttonVariants} from '@/components/ui/button'
import {Loading} from '@/components/ui/Loading'
import {ErrorLista} from '@/components/common/ErrorLista'
import {formatarAndar, formatarMedida} from '@/lib/ambientes/formatters'
import type {CatalogoNavState} from '@/types/ambientes/navegacao'
import {parseIdPositivo} from '@/lib/utils/parse-id'

function textoAmbientes(total: number): string {
    return `${total} ambiente${total === 1 ? '' : 's'}`
}

export function BlocoPage() {
    const {blocoId} = useParams<{blocoId: string}>()
    const location = useLocation()
    const estado = (location.state ?? {}) as CatalogoNavState
    const id = parseIdPositivo(blocoId)

    const {data: resumo, isLoading, error, refetch} =
        useBlocoResumo(id)

    const campusId = estado.campus?.id
    const unidadeId = estado.unidade?.id

    const trilhos: TrilhoBreadcrumb[] = [
        ...(estado.campus
            ? [{nome: estado.campus.nome, href: rotaCampus(estado.campus.id)}]
            : []),
        ...(estado.unidade
            ? [{nome: estado.unidade.nome, href: rotaUnidade(estado.unidade.id)}]
            : []),
        {nome: resumo?.nome ?? 'Bloco'},
    ]

    if (id === null) {
        return <EstadoBlocoNaoEncontrado trilhos={[{nome: 'Bloco não encontrado'}]}/>
    }

    if (isLoading) return <Loading/>

    if (error) {
        const naoEncontrado = isAxiosError(error) && error.response?.status === 404
        if (naoEncontrado) {
            return <EstadoBlocoNaoEncontrado trilhos={trilhos}/>
        }
        return (
            <div className="space-y-4">
                <Breadcrumb trilhos={trilhos}/>
                <ErrorLista onTentarNovamente={() => void refetch()}/>
            </div>
        )
    }

    if (!resumo) return <EstadoBlocoNaoEncontrado trilhos={trilhos}/>

    return (
        <section className="space-y-6">
            <Breadcrumb trilhos={trilhos}/>

            <div className="flex flex-wrap items-center justify-between gap-2">
                <h1 className="text-2xl font-bold">{resumo.nome}</h1>
                <Link
                    to={rotaListagemPublicados({campusId, unidadeId, blocoId: resumo.id})}
                    className={buttonVariants({variant: 'outline'})}
                >
                    Ver todos os ambientes do bloco
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Card>
                    <CardHeader><CardTitle>Área total</CardTitle></CardHeader>
                    <CardContent>{formatarMedida(resumo.areaTotal)} m²</CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Pavimentos</CardTitle></CardHeader>
                    <CardContent>{resumo.pavimentos}</CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Capacidade total</CardTitle></CardHeader>
                    <CardContent>{resumo.capacidadeTotal} pessoas</CardContent>
                </Card>
            </div>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Tipos de ambiente</h2>
                {resumo.tipos.length === 0 ? (
                    <EstadoVazio mensagem="Nenhum tipo publicado."/>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {resumo.tipos.map((item) => (
                            <CardLink
                                key={item.tipo}
                                to={rotaListagemPublicados({
                                    campusId,
                                    unidadeId,
                                    blocoId: resumo.id,
                                    tipo: item.tipo,
                                })}
                                ariaLabel={`Ver ${textoAmbientes(item.total)} do tipo ${item.tipo}`}
                                titulo={item.tipo}
                                descricao={textoAmbientes(item.total)}
                            />
                        ))}
                    </div>
                )}
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Andares</h2>
                {resumo.andares.length === 0 ? (
                    <EstadoVazio mensagem="Nenhum andar publicado."/>
                ) : (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                        {resumo.andares.map((item) => (
                            <CardLink
                                key={item.andar}
                                to={rotaListagemPublicados({
                                    campusId,
                                    unidadeId,
                                    blocoId: resumo.id,
                                    andar: item.andar,
                                })}
                                ariaLabel={`Ver ambientes do ${item.andar === 0 ? 'térreo' : `andar ${item.andar}`}`}
                                titulo={formatarAndar(item.andar)}
                                descricao={textoAmbientes(item.total)}
                            />
                        ))}
                    </div>
                )}
            </section>
        </section>
    )
}

function EstadoBlocoNaoEncontrado({trilhos}: {trilhos: TrilhoBreadcrumb[]}) {
    return (
        <div className="space-y-4">
            <Breadcrumb trilhos={trilhos}/>
            <EstadoVazio
                mensagem="Bloco não encontrado ou sem ambientes publicados."
                acao={{rotulo: 'Voltar à home', para: PAGES_ROUTES.HOME}}
            />
        </div>
    )
}
