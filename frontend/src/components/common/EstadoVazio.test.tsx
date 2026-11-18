import {describe, expect, it} from 'vitest'
import {render, screen} from '@testing-library/react'
import {MemoryRouter} from 'react-router'
import {EstadoVazio} from './EstadoVazio'

describe('EstadoVazio', () => {
    it('exibe a mensagem sem ação quando ela não é informada', () => {
        render(
            <MemoryRouter>
                <EstadoVazio mensagem="Nenhum ambiente publicado."/>
            </MemoryRouter>,
        )

        expect(screen.getByText('Nenhum ambiente publicado.')).toBeInTheDocument()
        expect(screen.queryByRole('link')).not.toBeInTheDocument()
    })

    it('renderiza o link quando há ação', () => {
        render(
            <MemoryRouter>
                <EstadoVazio
                    mensagem="Campus não encontrado."
                    acao={{rotulo: 'Voltar à home', para: '/'}}
                />
            </MemoryRouter>,
        )

        expect(screen.getByRole('link', {name: 'Voltar à home'})).toHaveAttribute('href', '/')
    })
})
