import {describe, expect, it} from 'vitest'
import {
    DECIMAIS_MEDIDA,
    formatarAndar,
    formatarAndarCompacto,
    formatarMedida,
} from './formatters'

describe('formatarMedida', () => {
    it('usa duas casas decimais', () => {
        expect(DECIMAIS_MEDIDA).toBe(2)
    })

    it('arredonda para duas casas', () => {
        expect(formatarMedida(345.675)).toBe('345.68')
    })

    it('formata zero', () => {
        expect(formatarMedida(0)).toBe('0.00')
    })
})

describe('formatarAndar', () => {
    it('usa Térreo para o andar zero', () => {
        expect(formatarAndar(0)).toBe('Térreo')
    })

    it('usa o formato ordinal para os demais andares', () => {
        expect(formatarAndar(2)).toBe('2º Andar')
    })
})

describe('formatarAndarCompacto', () => {
    it('usa Térreo para o andar zero', () => {
        expect(formatarAndarCompacto(0)).toBe('Térreo')
    })

    it('usa o ordinal compacto para os demais andares', () => {
        expect(formatarAndarCompacto(2)).toBe('2º')
    })
})
