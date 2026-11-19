import type {ReactNode} from 'react'
import {Link} from 'react-router'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import type {CatalogoNavState} from '@/types/ambientes/navegacao'

interface CardLinkProps {
    to: string
    state?: CatalogoNavState
    ariaLabel: string
    titulo: ReactNode
    descricao: ReactNode
}

export function CardLink({to, state, ariaLabel, titulo, descricao}: CardLinkProps) {
    return (
        <Link
            to={to}
            state={state}
            className="rounded-xl focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={ariaLabel}
        >
            <Card className="h-full transition-colors hover:bg-muted/50">
                <CardHeader>
                    <CardTitle>{titulo}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                    {descricao}
                </CardContent>
            </Card>
        </Link>
    )
}
