import {describe, expect, it, vi, beforeEach} from 'vitest'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {MemoryRouter} from 'react-router'
import {HomePage} from './page'
import {useCampusPublicados} from '@/hooks/useReferenciasPublicadas'
import type {UseQueryResult} from '@tanstack/react-query'
import type {ReferenciaRes} from '@/types/ambientes/referencia'

vi.mock('@/hooks/useReferenciasPublicadas', () => ({
    useCampusPublicados: vi.fn(),
}))

const CAMPUS: ReferenciaRes[] = [
    {id: 7, nome: 'LIMOEIRO DO NORTE'},
    {id: 9, nome: 'QUIXADÁ'},
]

function resultado<T>(data: T): UseQueryResult<T, Error> {
    return {
        data,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
    } as unknown as UseQueryResult<T, Error>
}

function renderPage() {
    return render(
        <MemoryRouter>
            <HomePage/>
        </MemoryRouter>,
    )
}

describe('HomePage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('lista os campi e o CTA da listagem', () => {
        vi.mocked(useCampusPublicados).mockReturnValue(resultado(CAMPUS))

        renderPage()

        expect(screen.getByRole('heading', {name: 'Campus'})).toBeInTheDocument()
        expect(screen.getByText('Explore os ambientes de cada campus.')).toBeInTheDocument()
        expect(screen.getByRole('link', {name: 'Abrir campus LIMOEIRO DO NORTE'})).toHaveAttribute('href', '/campus/7')
        expect(screen.getByRole('link', {name: 'Abrir campus QUIXADÁ'})).toHaveAttribute('href', '/campus/9')
        expect(screen.getByRole('link', {name: 'Ver todos os ambientes'})).toHaveAttribute('href', '/ambientes/publicados')
    })

    it('exibe estado vazio quando não há campi publicados', () => {
        vi.mocked(useCampusPublicados).mockReturnValue(resultado<ReferenciaRes[]>([]))

        renderPage()

        expect(screen.getByText('Nenhum ambiente publicado no momento.')).toBeInTheDocument()
    })

    it('exibe erro com ação de tentar novamente', async () => {
        const refetch = vi.fn()
        vi.mocked(useCampusPublicados).mockReturnValue({
            data: undefined,
            isLoading: false,
            error: new Error('falha'),
            refetch,
        } as unknown as UseQueryResult<ReferenciaRes[], Error>)

        renderPage()

        const user = userEvent.setup()
        await user.click(screen.getByRole('button', {name: 'Tentar novamente'}))
        expect(refetch).toHaveBeenCalledTimes(1)
    })
})
