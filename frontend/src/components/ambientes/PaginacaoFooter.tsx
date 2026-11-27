import { Button } from '@/components/ui/button'
import { formatarMedida } from '@/lib/ambientes/formatters'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

const TAMANHOS_PAGINA = [10, 20, 50, 100]

interface PaginacaoFooterProps {
    page: number
    size: number
    areaTotal: number
    hasPrevious: boolean
    hasNext: boolean
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    onSizeChange: (size: string | null) => void
}

/**
 * Rodapé de paginação + Área Total, compartilhado pelas listas de ambientes
 * (publicados, validação e não-publicados).
 */
export function PaginacaoFooter({
    page,
    size,
    areaTotal,
    hasPrevious,
    hasNext,
    currentPage,
    totalPages,
    onPageChange,
    onSizeChange,
}: PaginacaoFooterProps) {
    return (
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
            <span className="text-sm text-muted-foreground">
                Área Total: {formatarMedida(areaTotal)} m²
            </span>
            <div className="flex items-center justify-between gap-2 md:justify-start">
                <span className="text-sm text-muted-foreground">Itens por página:</span>
                <Select value={String(size)} onValueChange={onSizeChange}>
                    <SelectTrigger
                        className="min-h-11 w-[70px] md:min-h-0"
                        aria-label="Itens por página"
                    >
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {TAMANHOS_PAGINA.map((t) => (
                            <SelectItem key={t} value={String(t)}>
                                {t}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <Button
                    variant="outline"
                    size="sm"
                    className="min-h-11 w-full md:min-h-0 md:w-auto"
                    disabled={!hasPrevious}
                    onClick={() => onPageChange(page - 1)}
                >
                    Anterior
                </Button>
                <span className="flex items-center justify-center text-sm">
                    Página {currentPage + 1} de {totalPages}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    className="min-h-11 w-full md:min-h-0 md:w-auto"
                    disabled={!hasNext}
                    onClick={() => onPageChange(page + 1)}
                >
                    Próximo
                </Button>
            </div>
        </div>
    )
}
