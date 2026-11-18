import {describe, expect, it, vi, beforeEach} from 'vitest'
import {render, screen, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {MemoryRouter, Route, Routes} from 'react-router'
import {BlocoPage} from './page'
import {useBlocoResumo} from '@/hooks/useReferenciasPublicadas'
import type {BlocoResumo} from '@/types/ambientes/bloco'
import type {CatalogoNavState} from '@/types/ambientes/navegacao'
import type {UseQueryResult} from '@tanstack/react-query'

vi.mock('@/hooks/useReferenciasPublicadas', () => ({
    useBlocoResumo: vi.fn(),
}))

const RESUMO: BlocoResumo = {
    id: 12,
    nome: 'BLOCO 2',
    areaTotal: 345.67,
    pavimentos: 4,
    capacidadeTotal: 210,
    tipos: [
        {tipo: 'Sala de Aula', total: 8},
        {tipo: 'Laboratório', total: 2},
    ],
    andares: [
        {andar: 0, total: 3},
        {andar: 2, total: 4},
    ],
}

function resultado(data: BlocoResumo): UseQueryResult<BlocoResumo, Error> {
    return {
        data,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
    } as unknown as UseQueryResult<BlocoResumo, Error>
}

const NAV_STATE: CatalogoNavState = {
    campus: {id: 1, nome: 'LIMOEIRO'},
    unidade: {id: 2, nome: 'SEDE'},
}

function renderPage(path = '/bloco/12', state?: CatalogoNavState) {
    return render(
        <MemoryRouter initialEntries={[state ? {pathname: path, state} : {pathname: path}]}>
            <Routes>
                <Route path="/bloco/:blocoId" element={<BlocoPage/>}/>
            </Routes>
        </MemoryRouter>,
    )
}

function hrefDoLink(nome: string): URL {
    const link = screen.getByRole('link', {name: nome})
    return new URL(link.getAttribute('href')!, 'http://x')
}

describe('BlocoPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(useBlocoResumo).mockReturnValue(resultado(RESUMO))
    })

    it('exibe o resumo do bloco', () => {
        renderPage()

        expect(screen.getByRole('heading', {name: 'BLOCO 2'})).toBeInTheDocument()
        expect(screen.getByText('345.67 m²')).toBeInTheDocument()
        expect(screen.getByText('210 pessoas')).toBeInTheDocument()

        const cardPavimentos = screen.getByText('Pavimentos').closest('[data-slot="card"]')
        expect(cardPavimentos).not.toBeNull()
        expect(within(cardPavimentos as HTMLElement).getByText('4')).toBeInTheDocument()

        expect(hrefDoLink('Ver todos os ambientes do bloco').searchParams.get('blocoId')).toBe('12')
    })

    it('linka os tipos com a contagem e o rótulo exato', () => {
        renderPage()

        const urlSala = hrefDoLink('Ver 8 ambientes do tipo Sala de Aula')
        expect(urlSala.searchParams.get('blocoId')).toBe('12')
        expect(urlSala.searchParams.get('tipo')).toBe('Sala de Aula')

        const urlLab = hrefDoLink('Ver 2 ambientes do tipo Laboratório')
        expect(urlLab.searchParams.get('tipo')).toBe('Laboratório')
    })

    it('linka os andares com o rótulo formatado', () => {
        renderPage()

        expect(screen.getByText('Térreo')).toBeInTheDocument()
        expect(screen.getByText('2º Andar')).toBeInTheDocument()

        const urlTerreo = hrefDoLink('Ver ambientes do térreo')
        expect(urlTerreo.searchParams.get('andar')).toBe('0')
        expect(urlTerreo.searchParams.get('blocoId')).toBe('12')

        const urlSegundo = hrefDoLink('Ver ambientes do andar 2')
        expect(urlSegundo.searchParams.get('andar')).toBe('2')
    })

    it('inclui campus e unidade da navegação nos links da listagem', () => {
        renderPage('/bloco/12', NAV_STATE)

        const urlTodos = hrefDoLink('Ver todos os ambientes do bloco')
        expect(urlTodos.searchParams.get('campusId')).toBe('1')
        expect(urlTodos.searchParams.get('unidadeId')).toBe('2')
        expect(urlTodos.searchParams.get('blocoId')).toBe('12')

        const urlTipo = hrefDoLink('Ver 8 ambientes do tipo Sala de Aula')
        expect(urlTipo.searchParams.get('campusId')).toBe('1')
        expect(urlTipo.searchParams.get('unidadeId')).toBe('2')
        expect(urlTipo.searchParams.get('blocoId')).toBe('12')
        expect(urlTipo.searchParams.get('tipo')).toBe('Sala de Aula')

        const urlAndar = hrefDoLink('Ver ambientes do térreo')
        expect(urlAndar.searchParams.get('campusId')).toBe('1')
        expect(urlAndar.searchParams.get('unidadeId')).toBe('2')
        expect(urlAndar.searchParams.get('andar')).toBe('0')
    })

    it('usa singular quando o total é 1', () => {
        vi.mocked(useBlocoResumo).mockReturnValue(resultado({
            ...RESUMO,
            tipos: [{tipo: 'Auditório', total: 1}],
            andares: [{andar: 1, total: 1}],
        }))

        renderPage()

        expect(hrefDoLink('Ver 1 ambiente do tipo Auditório').searchParams.get('tipo')).toBe('Auditório')
        expect(screen.getByRole('link', {name: 'Ver ambientes do andar 1'})).toBeInTheDocument()
        expect(screen.getAllByText('1 ambiente')).toHaveLength(2)
    })

    it('exibe estado de bloco não encontrado no 404', () => {
        vi.mocked(useBlocoResumo).mockReturnValue({
            data: undefined,
            isLoading: false,
            error: Object.assign(new Error('404'), {isAxiosError: true, response: {status: 404}}),
            refetch: vi.fn(),
        } as unknown as UseQueryResult<BlocoResumo, Error>)

        renderPage()

        expect(screen.getByText('Bloco não encontrado ou sem ambientes publicados.')).toBeInTheDocument()
        expect(screen.getByRole('link', {name: 'Voltar à home'})).toHaveAttribute('href', '/')
    })

    it('exibe ErrorLista e permite tentar novamente em erro genérico', async () => {
        const refetch = vi.fn()
        vi.mocked(useBlocoResumo).mockReturnValue({
            data: undefined,
            isLoading: false,
            error: new Error('falha'),
            refetch,
        } as unknown as UseQueryResult<BlocoResumo, Error>)

        renderPage()

        expect(screen.getByText('Erro ao carregar ambientes.')).toBeInTheDocument()
        await userEvent.setup().click(screen.getByRole('button', {name: 'Tentar novamente'}))
        expect(refetch).toHaveBeenCalledTimes(1)
    })

    it('monta o breadcrumb completo quando há location.state', () => {
        renderPage('/bloco/12', NAV_STATE)

        expect(screen.getByRole('link', {name: 'Início'})).toHaveAttribute('href', '/')
        expect(screen.getByRole('link', {name: 'LIMOEIRO'})).toHaveAttribute('href', '/campus/1')
        expect(screen.getByRole('link', {name: 'SEDE'})).toHaveAttribute('href', '/unidade/2')
        const breadcrumb = screen.getByRole('navigation', {name: 'breadcrumb'})
        expect(within(breadcrumb).getByText('BLOCO 2')).toHaveAttribute('aria-current', 'page')
    })

    it('em deep link sem state mostra apenas o bloco e mantém o conteúdo', () => {
        renderPage()

        expect(screen.getByRole('heading', {name: 'BLOCO 2'})).toBeInTheDocument()
        expect(screen.queryByRole('link', {name: 'LIMOEIRO'})).not.toBeInTheDocument()
        expect(screen.queryByRole('link', {name: 'SEDE'})).not.toBeInTheDocument()
        const breadcrumb = screen.getByRole('navigation', {name: 'breadcrumb'})
        expect(within(breadcrumb).getByText('BLOCO 2')).toHaveAttribute('aria-current', 'page')
    })

    it('exibe estado de bloco não encontrado para id inválido', () => {
        vi.mocked(useBlocoResumo).mockReturnValue({
            data: undefined,
            isLoading: false,
            error: null,
            refetch: vi.fn(),
        } as unknown as UseQueryResult<BlocoResumo, Error>)

        renderPage('/bloco/abc')

        expect(screen.getByText('Bloco não encontrado ou sem ambientes publicados.')).toBeInTheDocument()
        expect(useBlocoResumo).toHaveBeenCalledWith(null)
    })
})
