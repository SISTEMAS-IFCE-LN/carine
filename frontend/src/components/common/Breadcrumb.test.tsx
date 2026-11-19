import {describe, expect, it} from 'vitest'
import {render, screen} from '@testing-library/react'
import {MemoryRouter} from 'react-router'
import {Breadcrumb} from './Breadcrumb'

describe('Breadcrumb', () => {
    it('renderiza Início, trilhos intermediários e o item atual', () => {
        render(
            <MemoryRouter>
                <Breadcrumb
                    trilhos={[
                        {nome: 'LIMOEIRO', href: '/campus/7'},
                        {nome: 'CIDADE ALTA'},
                    ]}
                />
            </MemoryRouter>,
        )

        expect(screen.getByRole('navigation', {name: 'breadcrumb'})).toBeInTheDocument()
        expect(screen.getByRole('link', {name: 'Início'})).toHaveAttribute('href', '/')
        expect(screen.getByRole('link', {name: 'LIMOEIRO'})).toHaveAttribute('href', '/campus/7')
        expect(screen.getByText('CIDADE ALTA')).toHaveAttribute('aria-current', 'page')
    })
})
