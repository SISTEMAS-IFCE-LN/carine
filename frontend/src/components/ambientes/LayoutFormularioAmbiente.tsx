import type {ReactNode} from 'react'

interface LayoutFormularioAmbienteProps {
    titulo: string
    descricao?: ReactNode
    /** Ação opcional no topo (ex.: Cancelar), alinhada ao título. */
    acao?: ReactNode
    children: ReactNode
}

/**
 * Layout compartilhado das páginas que hospedam o `FormAmbiente`
 * (cadastro UC06-FE e alteração de tipo UC16-FE), garantindo a mesma
 * largura, espaçamento e cabeçalho nos dois fluxos.
 */
export function LayoutFormularioAmbiente({
    titulo,
    descricao,
    acao,
    children,
}: LayoutFormularioAmbienteProps) {
    return (
        <div className="mx-auto w-full max-w-2xl space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold">{titulo}</h1>
                    {descricao && (
                        <p className="text-sm text-muted-foreground">{descricao}</p>
                    )}
                </div>
                {acao}
            </div>
            {children}
        </div>
    )
}
