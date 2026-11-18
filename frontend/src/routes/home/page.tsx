import {Link} from 'react-router'
import {useCampusPublicados} from '@/hooks/useReferenciasPublicadas'
import {rotaCampus, PAGES_ROUTES} from '@/constants/routes'
import {buttonVariants} from '@/components/ui/button'
import {Loading} from '@/components/ui/Loading'
import {CardLink} from '@/components/common/CardLink'
import {EstadoVazio} from '@/components/common/EstadoVazio'
import {ErrorLista} from '@/components/common/ErrorLista'

export function HomePage() {
    const {data: campi = [], isLoading, error, refetch} = useCampusPublicados()

    if (isLoading) return <Loading/>
    if (error) return <ErrorLista onTentarNovamente={() => void refetch()}/>

    return (
        <section className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold">Campus disponíveis</h1>
                    <p className="text-muted-foreground">
                        Explore os ambientes de cada campus.
                    </p>
                </div>
                <Link
                    to={PAGES_ROUTES.PUBLICADOS}
                    className={buttonVariants({variant: 'outline'})}
                >
                    Ver todos os ambientes
                </Link>
            </div>

            {campi.length === 0 ? (
                <EstadoVazio mensagem="Nenhum ambiente publicado no momento."/>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {campi.map((campus) => (
                        <CardLink
                            key={campus.id}
                            to={rotaCampus(campus.id)}
                            state={{campus}}
                            ariaLabel={`Abrir campus ${campus.nome}`}
                            titulo={campus.nome}
                            descricao="Ver unidades"
                        />
                    ))}
                </div>
            )}
        </section>
    )
}
