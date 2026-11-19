import {describe, expect, it, vi, beforeEach} from 'vitest'
import {render, screen, within} from '@testing-library/react'
import {MemoryRouter, Route, Routes} from 'react-router'
import {UnidadePage} from './page'
import {useBlocosPublicados} from '@/hooks/useReferenciasPublicadas'
import type {UseQueryResult} from '@tanstack/react-query'
import type {ReferenciaRes} from '@/types/ambientes/referencia'

vi.mock('@/hooks/useReferenciasPublicadas', () => ({
    useBlocosPublicados: vi.fn(),
}))

const CAMPUS: ReferenciaRes = {id: 7, nome: 'LIMOEIRO DO NORTE'}
const UNIDADE: ReferenciaRes = {id: 3, nome: 'CIDADE ALTA'}
const BLOCO: ReferenciaRes = {id: 12, nome: 'BLOCO 2'}

function resultado<T>(data: T): UseQueryResult<T, Error> {
    return {
        data,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
    } as unknown as UseQueryResult<T, Error>
}

function renderPage(path = '/unidade/3', comEstado = true) {
    const entrada = comEstado
        ? {pathname: path, state: {campus: CAMPUS, unidade: UNIDADE}}
        : {pathname: path}

    return render(
        <MemoryRouter initialEntries={[entrada]}>
            <Routes>
                <Route path="/unidade/:unidadeId" element={<UnidadePage/>}/>
            </Routes>
        </MemoryRouter>,
    )
}

describe('UnidadePage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('lista os blocos com breadcrumb e CTA da unidade', () => {
        vi.mocked(useBlocosPublicados).mockReturnValue(resultado([BLOCO]))

        renderPage()

        expect(screen.getByRole('link', {name: 'Abrir bloco BLOCO 2'})).toHaveAttribute('href', '/bloco/12')
        expect(screen.getByRole('link', {name: 'Ver todos os ambientes da unidade'}))
            .toHaveAttribute('href', '/ambientes/publicados?campusId=7&unidadeId=3')
        expect(screen.getByRole('link', {name: 'LIMOEIRO DO NORTE'})).toHaveAttribute('href', '/campus/7')
        const breadcrumb = screen.getByRole('navigation', {name: 'breadcrumb'})
        expect(within(breadcrumb).getByText('CIDADE ALTA')).toHaveAttribute('aria-current', 'page')
    })

    it('exibe estado vazio com retorno ao campus', () => {
        vi.mocked(useBlocosPublicados).mockReturnValue(resultado<ReferenciaRes[]>([]))

        renderPage()

        expect(screen.getByText('Nenhum bloco com ambientes publicados nesta unidade.')).toBeInTheDocument()
        expect(screen.getByRole('link', {name: 'Voltar ao campus'})).toHaveAttribute('href', '/campus/7')
    })

    it('em deep link sem state, CTA mantém apenas unidadeId e o trilho degrada', () => {
        vi.mocked(useBlocosPublicados).mockReturnValue(resultado([BLOCO]))

        renderPage('/unidade/3', false)

        expect(screen.getByRole('link', {name: 'Ver todos os ambientes da unidade'}))
            .toHaveAttribute('href', '/ambientes/publicados?unidadeId=3')
        expect(screen.queryByRole('link', {name: 'LIMOEIRO DO NORTE'})).not.toBeInTheDocument()
        const breadcrumb = screen.getByRole('navigation', {name: 'breadcrumb'})
        expect(within(breadcrumb).getByText('Campus')).toBeInTheDocument()
        expect(within(breadcrumb).getByText('Unidade')).toHaveAttribute('aria-current', 'page')
    })
})
