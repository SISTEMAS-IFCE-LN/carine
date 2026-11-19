import {describe, expect, it} from 'vitest'
import {chaveTipoAmbiente} from './enums'

describe('chaveTipoAmbiente', () => {
    it('converte o rótulo no nome técnico', () => {
        expect(chaveTipoAmbiente('Laboratório')).toBe('LABORATORIO')
        expect(chaveTipoAmbiente('Laboratório de Informática')).toBe('LABORATORIO_INFORMATICA')
    })

    it('é idempotente para a chave técnica', () => {
        expect(chaveTipoAmbiente('SALA_AULA')).toBe('SALA_AULA')
        expect(chaveTipoAmbiente('LABORATORIO_INFORMATICA')).toBe('LABORATORIO_INFORMATICA')
    })

    it('ignora caixa e acentos', () => {
        expect(chaveTipoAmbiente('sala de aula')).toBe('SALA_AULA')
        expect(chaveTipoAmbiente('VESTIARIO')).toBe('VESTIARIO')
        expect(chaveTipoAmbiente('Vestiário')).toBe('VESTIARIO')
    })

    it('mantém valores desconhecidos e vazios', () => {
        expect(chaveTipoAmbiente('lab')).toBe('lab')
        expect(chaveTipoAmbiente('')).toBe('')
    })
})
