import {describe, expect, it, vi, beforeEach} from 'vitest'
import {render, screen, within} from '@testing-library/react'
import {MemoryRouter, Route, Routes} from 'react-router'
import {CampusPage} from './page'
import {useCampusPublicados, useUnidadesPublicados} from '@/hooks/useReferenciasPublicadas'
import type {UseQueryResult} from '@tanstack/react-query'
import type {ReferenciaRes} from '@/types/ambientes/referencia'

vi.mock('@/hooks/useReferenciasPublicadas', () => ({
    useCampusPublicados: vi.fn(),
    useUnidadesPublicados: vi.fn(),
    useBlocosPublicados: vi.fn(),
}))

const CAMPUS: ReferenciaRes = {id: 7, nome: 'LIMOEIRO DO NORTE'}
const UNIDADE: ReferenciaRes = {id: 3, nome: 'CIDADE ALTA'}

function resultado<T>(data: T): UseQueryResult<T, Error> {
    return {
        data,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
    } as unknown as UseQueryResult<T, Error>
}

function renderPage(path = '/campus/7') {
    return render(
        <MemoryRouter initialEntries={[{pathname: path, state: {campus: CAMPUS}}]}>
            <Routes>
                <Route path="/campus/:campusId" element={<CampusPage/>}/>
            </Routes>
        </MemoryRouter>,
    )
}

describe('CampusPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(useCampusPublicados).mockReturnValue(resultado([CAMPUS]))
    })

    it('lista as unidades com breadcrumb e CTA do campus', () => {
        vi.mocked(useUnidadesPublicados).mockReturnValue(resultado([UNIDADE]))

        renderPage()

        expect(screen.getByRole('link', {name: 'Abrir unidade CIDADE ALTA'})).toHaveAttribute('href', '/unidade/3')
        expect(screen.getByRole('link', {name: 'Ver todos os ambientes do campus'}))
            .toHaveAttribute('href', '/ambientes/publicados?campusId=7')
        expect(screen.getByRole('link', {name: 'Início'})).toHaveAttribute('href', '/')
        const breadcrumb = screen.getByRole('navigation', {name: 'breadcrumb'})
        expect(within(breadcrumb).getByText('LIMOEIRO DO NORTE')).toHaveAttribute('aria-current', 'page')
    })

    it('exibe estado vazio com retorno à home', () => {
        vi.mocked(useUnidadesPublicados).mockReturnValue(resultado<ReferenciaRes[]>([]))

        renderPage()

        expect(screen.getByText('Nenhuma unidade com ambientes publicados neste campus.')).toBeInTheDocument()
        expect(screen.getByRole('link', {name: 'Voltar à home'})).toHaveAttribute('href', '/')
    })

    it('exibe estado de campus não encontrado para id inválido', () => {
        vi.mocked(useUnidadesPublicados).mockReturnValue(resultado<ReferenciaRes[]>([]))

        renderPage('/campus/abc')

        expect(screen.getByText('Campus não encontrado.')).toBeInTheDocument()
        expect(screen.getByRole('link', {name: 'Voltar à home'})).toHaveAttribute('href', '/')
    })
})
