import {describe, expect, it} from 'vitest'
import {PAGES_ROUTES, rotaCampus, rotaListagemPublicados, rotaUnidade} from './routes'

describe('rotaCampus/rotaUnidade', () => {
    it('monta as rotas de navegação', () => {
        expect(rotaCampus(7)).toBe('/campus/7')
        expect(rotaUnidade(3)).toBe('/unidade/3')
    })
})

describe('rotaListagemPublicados', () => {
    it('retorna a listagem sem query quando não há parâmetros', () => {
        expect(rotaListagemPublicados()).toBe(PAGES_ROUTES.PUBLICADOS)
    })

    it('omite nulos e strings vazias', () => {
        expect(rotaListagemPublicados({campusId: null, unidadeId: 3, tipo: '   '}))
            .toBe('/ambientes/publicados?unidadeId=3')
    })

    it('codifica o tipo com espaço e permite recuperar o valor', () => {
        const href = rotaListagemPublicados({blocoId: 12, tipo: 'Sala de Aula'})
        const url = new URL(href, 'http://x')

        expect(url.pathname).toBe('/ambientes/publicados')
        expect(url.searchParams.get('blocoId')).toBe('12')
        expect(url.searchParams.get('tipo')).toBe('Sala de Aula')
    })
})
