import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {Badge} from '@/components/ui/badge'
import {Checkbox} from '@/components/ui/checkbox'
import type {AmbienteBasico} from '@/types/ambientes/response'
import {Link} from 'react-router'
import {formatarAndarCompacto, formatarMedida} from '@/lib/ambientes/formatters'
import {useIsMobile} from '@/hooks/useIsMobile'

interface TabelaPadraoProps {
    itens: AmbienteBasico[]
    /** Base da rota de detalhe. Default: '/ambientes/publicados' (lista pública). */
    detalheBasePath?: string
    /** Quando ausente, a tabela não exibe checkboxes (modo público/anônimo). */
    selectedIds?: number[]
    onToggleSelect?: (id: number) => void
    onToggleSelectAll?: () => void
    allSelected?: boolean
    someSelected?: boolean
}

/**
 * Lista de ambientes (arquitetura-frontend.md §15.7): tabela em ≥md e cards
 * empilhados em <md. As listas de ambientes não têm ações por item — o kebab
 * continua exclusivo da TabelaUsuarios.
 */
export function TabelaPadrao({
    itens,
    detalheBasePath = '/ambientes/publicados',
    selectedIds,
    onToggleSelect,
    onToggleSelectAll,
    allSelected,
    someSelected,
}: TabelaPadraoProps) {
    const isMobile = useIsMobile()
    const comSelecao = typeof onToggleSelect === 'function'

    if (isMobile) {
        return (
            <div className="space-y-3 md:hidden" data-testid="tabela-cards">
                {itens.map((a) => {
                    const selecionado = comSelecao && selectedIds?.includes(a.id)

                    return (
                        <div
                            key={a.id}
                            className="rounded-lg border bg-card p-3 shadow-sm"
                            data-selected={selecionado || undefined}
                        >
                            <div className="flex items-start gap-2">
                                {comSelecao && (
                                    <Checkbox
                                        aria-label={`Selecionar ${a.nome}`}
                                        checked={selecionado ?? false}
                                        onCheckedChange={() => onToggleSelect?.(a.id)}
                                    />
                                )}
                                <Link
                                    to={`${detalheBasePath}/${a.id}`}
                                    className="font-semibold text-primary hover:underline"
                                >
                                    {a.nome}
                                </Link>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-1">
                                <Badge variant="secondary">{a.tipo}</Badge>
                                <Badge
                                    variant="outline"
                                    className="h-auto max-w-full whitespace-normal py-1 text-left"
                                >
                                    {a.localizacao.campus.nome} • {a.localizacao.unidade.nome} • {a.localizacao.bloco.nome}
                                </Badge>
                                <Badge variant="outline">
                                    {formatarAndarCompacto(a.localizacao.andar)}
                                </Badge>
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Capacidade {a.capacidade} • {formatarMedida(a.area)} m²
                            </p>
                        </div>
                    )
                })}
            </div>
        )
    }

    return (
        <div className="hidden md:block">
            <Table>
                <TableHeader>
                    <TableRow>
                        {comSelecao && (
                            <TableHead className="w-[40px]">
                                <Checkbox
                                    aria-label="Selecionar todos da página"
                                    checked={allSelected ?? false}
                                    indeterminate={someSelected && !allSelected}
                                    onCheckedChange={() => onToggleSelectAll?.()}
                                />
                            </TableHead>
                        )}
                        <TableHead>Nome</TableHead>
                        <TableHead>Localização</TableHead>
                        <TableHead>Andar</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Capacidade</TableHead>
                        <TableHead>Área</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {itens.map((a) => {
                        const selecionado = comSelecao && selectedIds?.includes(a.id)

                        return (
                            <TableRow key={a.id} data-selected={selecionado || undefined}>
                                {comSelecao && (
                                    <TableCell className="w-[40px]">
                                        <Checkbox
                                            aria-label={`Selecionar ${a.nome}`}
                                            checked={selecionado ?? false}
                                            onCheckedChange={() => onToggleSelect?.(a.id)}
                                        />
                                    </TableCell>
                                )}
                                <TableCell>
                                    <Link to={`${detalheBasePath}/${a.id}`} className="text-primary hover:underline">
                                        {a.nome}
                                    </Link>
                                </TableCell>
                                <TableCell>
                                    {a.localizacao.campus.nome} • {a.localizacao.unidade.nome} • {a.localizacao.bloco.nome}
                                </TableCell>
                                <TableCell>{formatarAndarCompacto(a.localizacao.andar)}</TableCell>
                                <TableCell>{a.tipo}</TableCell>
                                <TableCell>{a.capacidade}</TableCell>
                                <TableCell>{formatarMedida(a.area)}</TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}
