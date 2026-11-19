import {describe, expect, it} from 'vitest'
import {derivarTipoFiltro, FILTROS_VAZIOS, temLocalizacao, type Filtros} from './filtros'
import {TipoFiltro} from './enums'

function filtros(parcial: Partial<Filtros>): Filtros {
    return {...FILTROS_VAZIOS, ...parcial}
}

describe('derivarTipoFiltro', () => {
    it('prioriza NOME sobre tipo e localização', () => {
        expect(derivarTipoFiltro(filtros({nome: 'sala', tipo: 'SALA_AULA', campusId: 1})))
            .toBe(TipoFiltro.NOME)
    })

    it.each([
        ['campusId', {campusId: 1}],
        ['unidadeId', {unidadeId: 2}],
        ['blocoId', {blocoId: 3}],
        ['andar', {andar: 0}],
    ])('deriva LOCALIZACAO_TIPO com tipo e %s', (_campo, localizacao) => {
        expect(derivarTipoFiltro(filtros({tipo: 'SALA_AULA', ...localizacao})))
            .toBe(TipoFiltro.LOCALIZACAO_TIPO)
    })

    it('deriva TIPO quando só há tipo', () => {
        expect(derivarTipoFiltro(filtros({tipo: 'SALA_AULA'}))).toBe(TipoFiltro.TIPO)
    })

    it('deriva LOCALIZACAO quando só há localização', () => {
        expect(derivarTipoFiltro(filtros({blocoId: 12}))).toBe(TipoFiltro.LOCALIZACAO)
    })

    it('deriva NENHUM para filtros vazios', () => {
        expect(derivarTipoFiltro(FILTROS_VAZIOS)).toBe(TipoFiltro.NENHUM)
    })
})

describe('temLocalizacao', () => {
    it.each([
        {campusId: 1},
        {unidadeId: 2},
        {blocoId: 3},
        {andar: 0},
    ])('é verdadeiro com %o', (parcial) => {
        expect(temLocalizacao(filtros(parcial))).toBe(true)
    })

    it('é falso sem campos de localização', () => {
        expect(temLocalizacao(FILTROS_VAZIOS)).toBe(false)
    })
})
