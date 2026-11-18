import {z} from 'zod'

export const TipoTotalSchema = z.object({
    tipo: z.string(),
    total: z.int().nonnegative(),
})

export const AndarTotalSchema = z.object({
    andar: z.int().nonnegative(),
    total: z.int().nonnegative(),
})

export const BlocoResumoSchema = z.object({
    id: z.int().positive(),
    nome: z.string(),
    areaTotal: z.number(),
    pavimentos: z.int().positive(),
    capacidadeTotal: z.int().nonnegative(),
    tipos: z.array(TipoTotalSchema),
    andares: z.array(AndarTotalSchema),
})

export type BlocoResumo = z.infer<typeof BlocoResumoSchema>
