import {Link} from 'react-router'
import {PAGES_ROUTES} from '@/constants/routes'

export interface TrilhoBreadcrumb {
    nome: string
    /** Ausente no último item (página atual). */
    href?: string
}

interface BreadcrumbProps {
    trilhos: TrilhoBreadcrumb[]
}

export function Breadcrumb({trilhos}: BreadcrumbProps) {
    return (
        <nav aria-label="breadcrumb" className="text-sm">
            <ol className="flex flex-wrap items-center gap-1 text-muted-foreground">
                <li>
                    <Link to={PAGES_ROUTES.HOME} className="hover:underline">
                        Início
                    </Link>
                </li>
                {trilhos.map((trilho, index) => {
                    const atual = index === trilhos.length - 1
                    return (
                        <li key={`${trilho.nome}-${index}`} className="flex items-center gap-1">
                            <span aria-hidden="true">/</span>
                            {atual || !trilho.href ? (
                                <span aria-current={atual ? 'page' : undefined} className="text-foreground">
                                    {trilho.nome}
                                </span>
                            ) : (
                                <Link to={trilho.href} className="hover:underline">
                                    {trilho.nome}
                                </Link>
                            )}
                        </li>
                    )
                })}
            </ol>
        </nav>
    )
}
