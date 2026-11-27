import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import {describe, it, expect, vi, beforeEach} from 'vitest'
import {MemoryRouter, Route, Routes} from 'react-router'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {AlterarTipoAmbientePage} from './page'
import type {AmbienteDetalhe} from '@/types/ambientes/response'
import {
    MaterialEsquadria,
    StatusAmbiente,
    TipoAmbiente,
    TipoEsquadria,
    TipoGeometria,
} from '@/types/ambientes/enums'

vi.mock('sonner', () => ({
    toast: {success: vi.fn(), error: vi.fn()},
}))

const mockFetchAmbiente = vi.hoisted(() => vi.fn())
const mockAlterarTipo = vi.hoisted(() => vi.fn())
vi.mock('@/lib/api/api-naopublicados', () => ({
    fetchAmbienteNaoPublicado: (...args: unknown[]) => mockFetchAmbiente(...args),
    alterarTipo: (...args: unknown[]) => mockAlterarTipo(...args),
}))

vi.mock('@/hooks/useReferencias', () => ({
    useCampus: () => ({
        data: [{id: 1, nome: 'LIMOEIRO DO NORTE'}],
        isLoading: false,
    }),
    useUnidades: () => ({
        data: [{id: 1, nome: 'SEDE'}],
        isLoading: false,
    }),
    useBlocos: () => ({
        data: [{id: 1, nome: 'BLOCO 1'}],
        isLoading: false,
    }),
}))

const mockNavigate = vi.hoisted(() => vi.fn())
vi.mock('react-router', async (importOriginal) => {
    const actual = await importOriginal<typeof import('react-router')>()
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    }
})

const AMBIENTE: AmbienteDetalhe = {
    id: 7,
    nome: 'Sala 101',
    tipo: TipoAmbiente.SALA_AULA,
    localizacao: {
        id: 3,
        campus: {id: 1, nome: 'LIMOEIRO DO NORTE'},
        unidade: {id: 1, nome: 'SEDE'},
        bloco: {id: 1, nome: 'BLOCO 1'},
        andar: 2,
    },
    capacidade: 30,
    geometrias: [
        {id: 10, tipo: TipoGeometria.RETANGULAR, base: 4, altura: 3, repeticao: 2, area: 24},
    ],
    areaAmbiente: 24,
    pesDireitos: [3],
    esquadriasDetalhes: {
        esquadrias: [
            {
                id: 11,
                tipo: TipoEsquadria.PORTA,
                geometria: {id: 12, base: 0.9, altura: 2.1, repeticao: 1, area: 1.89},
                alturaPeitoril: 0,
                area: 1.89,
                material: MaterialEsquadria.ALUMINIO,
                informacaoAdicional: '',
            },
        ],
        esquadriasTipoMaterial: [],
    },
    informacaoAdicional: '',
    status: StatusAmbiente.NAO_PUBLICADO,
}

// Payload completo (AmbienteReq) esperado no POST /{id}.
const PAYLOAD_ESPERADO = {
    nome: 'Sala 101',
    tipo: 'SALA_AULA',
    capacidade: 30,
    localizacao: {
        campus: {id: 1, nome: null},
        unidade: {id: 1, nome: null},
        bloco: {id: 1, nome: null},
        andar: 2,
    },
    geometrias: [{tipo: 'RETANGULAR', base: 4, altura: 3, repeticao: 2}],
    pesDireitos: [3],
    esquadrias: [
        {
            tipo: 'PORTA',
            material: 'ALUMINIO',
            geometria: {base: 0.9, altura: 2.1, repeticao: 1},
            alturaPeitoril: 0,
            informacaoAdicional: '',
        },
    ],
    informacaoAdicional: '',
}

function createQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {retry: false, gcTime: 0, staleTime: 0, refetchOnWindowFocus: false},
        },
    })
}

function renderPage(
    initialEntries: string[] = ['/ambientes/nao-publicados/7/alterar-tipo'],
    client: QueryClient = createQueryClient(),
) {
    render(
        <QueryClientProvider client={client}>
            <MemoryRouter initialEntries={initialEntries}>
                <Routes>
                    <Route
                        path="/ambientes/nao-publicados/:id/alterar-tipo"
                        element={<AlterarTipoAmbientePage/>}
                    />
                </Routes>
            </MemoryRouter>
        </QueryClientProvider>,
    )
    return client
}

async function avancar(n: number, nome: string) {
    fireEvent.click(screen.getByRole('button', {name: 'Próximo'}))
    await waitFor(() => expect(buscarEtapa(n, nome)).not.toBeNull())
}

function buscarEtapa(n: number, nome: string) {
    const alvo = `Etapa ${n} de 5: ${nome}`
    return screen.queryByText((_, el) => el?.tagName === 'DIV' && el.textContent === alvo)
}

async function submeterWizard() {
    await avancar(2, 'Geometrias')
    await avancar(3, 'Pés-direitos')
    await avancar(4, 'Esquadrias')
    await avancar(5, 'Informação Adicional')
    fireEvent.click(screen.getByRole('button', {name: 'Salvar'}))
}

describe('AlterarTipoAmbientePage (UC16-FE)', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('exibe loading enquanto carrega', async () => {
        mockFetchAmbiente.mockReturnValueOnce(new Promise(() => {}))
        renderPage()
        expect(await screen.findByText('Carregando…')).toBeInTheDocument()
    })

    it('exibe "Ambiente não encontrado" quando o id é inválido sem chamar a API', async () => {
        renderPage(['/ambientes/nao-publicados/abc/alterar-tipo'])
        expect(await screen.findByText('Ambiente não encontrado.')).toBeInTheDocument()
        expect(mockFetchAmbiente).not.toHaveBeenCalled()
    })

    it('usa o mesmo layout da página de cadastro e alerta sobre a substituição', async () => {
        mockFetchAmbiente.mockResolvedValueOnce(AMBIENTE)
        renderPage()

        expect(await screen.findByRole('heading', {name: 'Alterar Tipo'})).toBeInTheDocument()
        expect(screen.getByText(/cria um novo ambiente e remove o antigo/)).toBeInTheDocument()
        expect(screen.getByRole('button', {name: 'Cancelar'})).toBeInTheDocument()
    })

    it('pré-preenche o wizard com os dados do ambiente convertidos para nomes técnicos', async () => {
        mockFetchAmbiente.mockResolvedValueOnce(AMBIENTE)
        renderPage()

        await waitFor(() => {
            expect(screen.getByLabelText('Nome')).toHaveValue('Sala 101')
        })
        expect(screen.getByLabelText('Capacidade')).toHaveValue(30)
        expect(screen.getByLabelText('Andar')).toHaveValue(2)
        expect(screen.getByLabelText('Campus')).toHaveTextContent('LIMOEIRO DO NORTE')
        expect(screen.getByLabelText('Unidade')).toHaveTextContent('SEDE')
        expect(screen.getByLabelText('Bloco')).toHaveTextContent('BLOCO 1')
        expect(screen.getByLabelText('Tipo')).toHaveTextContent('Sala de Aula')
    })

    it('submete o AmbienteReq COMPLETO, invalida as queries e navega para o novo id', async () => {
        mockFetchAmbiente.mockResolvedValueOnce(AMBIENTE)
        mockAlterarTipo.mockResolvedValueOnce({...AMBIENTE, id: 8, tipo: TipoAmbiente.LABORATORIO})
        const queryClient = renderPage()
        const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

        await waitFor(() => {
            expect(screen.getByLabelText('Nome')).toHaveValue('Sala 101')
        })
        await submeterWizard()

        await waitFor(() => {
            expect(mockAlterarTipo).toHaveBeenCalledWith(7, PAYLOAD_ESPERADO)
        })
        const {toast} = await import('sonner')
        expect(toast.success).toHaveBeenCalledWith('Tipo alterado.')
        expect(invalidateSpy).toHaveBeenCalledWith({queryKey: ['ambientes', 'nao-publicados']})
        expect(invalidateSpy).toHaveBeenCalledWith({queryKey: ['referencias']})
        expect(mockNavigate).toHaveBeenCalledWith(
            '/ambientes/nao-publicados/8',
            {replace: true},
        )
    })

    it('em erro do backend mantém o usuário na página e não navega', async () => {
        mockFetchAmbiente.mockResolvedValueOnce(AMBIENTE)
        mockAlterarTipo.mockRejectedValueOnce(
            Object.assign(new Error('Request failed'), {
                isAxiosError: true,
                response: {status: 400, data: {mensagem: 'Tipo inválido.'}},
            }),
        )
        renderPage()

        await waitFor(() => {
            expect(screen.getByLabelText('Nome')).toHaveValue('Sala 101')
        })
        await submeterWizard()

        const {toast} = await import('sonner')
        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Tipo inválido.')
        })
        expect(mockNavigate).not.toHaveBeenCalled()
        expect(screen.getByRole('heading', {name: 'Alterar Tipo'})).toBeInTheDocument()
    })

    it('Cancelar volta ao detalhe original substituindo a página de alteração', async () => {
        mockFetchAmbiente.mockResolvedValueOnce(AMBIENTE)
        renderPage()

        fireEvent.click(await screen.findByRole('button', {name: 'Cancelar'}))

        expect(mockNavigate).toHaveBeenCalledWith(
            '/ambientes/nao-publicados/7',
            {replace: true},
        )
    })
})
