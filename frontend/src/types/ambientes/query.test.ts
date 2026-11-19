import {describe, expect, it} from 'vitest'
import {paraAmbientesQuery} from './query'
import {FILTROS_VAZIOS, type Filtros} from './filtros'
import {TipoFiltro} from './enums'

function filtros(parcial: Partial<Filtros>): Filtros {
    return {...FILTROS_VAZIOS, ...parcial}
}

describe('paraAmbientesQuery', () => {
    it('omite filtros vazios e preserva paginação/tipoFiltro', () => {
        const query = paraAmbientesQuery(FILTROS_VAZIOS, 2, 50, TipoFiltro.NENHUM)

        expect(query).toEqual({
            page: 2,
            size: 50,
            nome: undefined,
            campusId: undefined,
            unidadeId: undefined,
            blocoId: undefined,
            andar: undefined,
            tipo: undefined,
            tipoFiltro: TipoFiltro.NENHUM,
        })
    })

    it('mapeia filtros preenchidos', () => {
        const query = paraAmbientesQuery(
            filtros({
                nome: 'sala',
                campusId: 1,
                unidadeId: 2,
                blocoId: 3,
                andar: 0,
                tipo: 'SALA_AULA',
            }),
            0,
            20,
            TipoFiltro.NOME,
        )

        expect(query).toMatchObject({
            nome: 'sala',
            campusId: 1,
            unidadeId: 2,
            blocoId: 3,
            andar: 0,
            tipo: 'SALA_AULA',
            tipoFiltro: TipoFiltro.NOME,
        })
    })
})
