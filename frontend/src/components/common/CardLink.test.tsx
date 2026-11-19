import {describe, expect, it} from 'vitest'
import {render, screen} from '@testing-library/react'
import {MemoryRouter} from 'react-router'
import {CardLink} from './CardLink'

describe('CardLink', () => {
    it('renderiza título, descrição e nome acessível', () => {
        render(
            <MemoryRouter>
                <CardLink
                    to="/campus/7"
                    state={{campus: {id: 7, nome: 'LIMOEIRO'}}}
                    ariaLabel="Abrir campus LIMOEIRO"
                    titulo="LIMOEIRO"
                    descricao="Ver unidades"
                />
            </MemoryRouter>,
        )

        expect(screen.getByRole('link', {name: 'Abrir campus LIMOEIRO'})).toHaveAttribute('href', '/campus/7')
        expect(screen.getByText('LIMOEIRO')).toBeInTheDocument()
        expect(screen.getByText('Ver unidades')).toBeInTheDocument()
    })
})
