import { z } from 'zod'
import {TipoFiltro} from '@/types/ambientes/enums'

export interface Filtros {
    nome: string
    campusId: number | null
    unidadeId: number | null
    blocoId: number | null
    andar: number | null
    tipo: string
}

export const FILTROS_VAZIOS: Filtros = {
    nome: '',
    campusId: null,
    unidadeId: null,
    blocoId: null,
    andar: null,
    tipo: '',
}

// Validações alinhadas ao backend (BaseController.kt)
const NomeFiltroSchema = z.string()
    .max(50, 'Máximo 50 caracteres')

const TipoFiltroSchema = z.string()
    .max(50, 'Máximo 50 caracteres')

// IDs de referência vêm da URL como string; null/'' significam "sem filtro".
// Valores ≤0 ou não inteiros são inválidos e derrubam o parse para o fallback.
const IdFiltroSchema = z.preprocess(
    (val) => (val === null || val === '' || val === undefined ? undefined : val),
    z.coerce.number().int().positive().nullable().default(null)
)

const AndarFiltroSchema = z.coerce.number()
    .int()
    .min(0, 'Andar deve ser maior ou igual a 0')
    .nullable()

// Schema para validar parâmetros de filtro da URL.
// Usa preprocess para converter null em undefined (searchParams.get() retorna null quando não existe).
export const FiltrosUrlSchema = z.object({
    nome: z.preprocess((val) => val === null ? undefined : val, NomeFiltroSchema.default('')),
    tipo: z.preprocess((val) => val === null ? undefined : val, TipoFiltroSchema.default('')),
    campusId: IdFiltroSchema,
    unidadeId: IdFiltroSchema,
    blocoId: IdFiltroSchema,
    andar: z.preprocess((val) => val === null ? undefined : val, AndarFiltroSchema.default(null)),
})

/** Verdadeiro quando ao menos um campo de localização está ativo. */
export function temLocalizacao(f: Filtros): boolean {
    return f.campusId !== null || f.unidadeId !== null ||
        f.blocoId !== null || f.andar !== null
}

/** Prioridade fechada: NOME → LOCALIZACAO_TIPO → TIPO → LOCALIZACAO → NENHUM. */
export function derivarTipoFiltro(f: Filtros): TipoFiltro {
    const localizacaoAtiva = temLocalizacao(f)

    if (f.nome) return TipoFiltro.NOME
    if (f.tipo && localizacaoAtiva) return TipoFiltro.LOCALIZACAO_TIPO
    if (f.tipo) return TipoFiltro.TIPO
    if (localizacaoAtiva) return TipoFiltro.LOCALIZACAO
    return TipoFiltro.NENHUM
}
