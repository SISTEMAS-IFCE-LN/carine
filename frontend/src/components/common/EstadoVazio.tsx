import type {ReactNode} from 'react'
import {Link} from 'react-router'
import {buttonVariants} from '@/components/ui/button'

interface EstadoVazioProps {
    mensagem: ReactNode
    /** Ação opcional; ex.: `{rotulo: 'Voltar à home', para: PAGES_ROUTES.HOME}`. */
    acao?: {rotulo: string; para: string}
}

export function EstadoVazio({mensagem, acao}: EstadoVazioProps) {
    return (
        <div className="space-y-3">
            <p className="text-muted-foreground">{mensagem}</p>
            {acao && (
                <Link to={acao.para} className={buttonVariants({variant: 'outline'})}>
                    {acao.rotulo}
                </Link>
            )}
        </div>
    )
}
