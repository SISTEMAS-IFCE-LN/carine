import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router'
import { TabelaPadrao } from './TabelaPadrao'
import type { AmbienteBasico } from '@/types/ambientes/response'
import { TipoAmbiente } from '@/types/ambientes/enums'

const mockUseIsMobile = vi.fn()

vi.mock('@/hooks/useIsMobile', () => ({
    useIsMobile: () => mockUseIsMobile(),
}))

const CAMPUS = { id: 1, nome: 'LIMOEIRO DO NORTE' }
const UNIDADE = { id: 1, nome: 'SEDE' }

const mockItens: AmbienteBasico[] = [
    {
        id: 1,
        nome: 'Sala 101',
        tipo: TipoAmbiente.SALA_AULA,
        localizacao: { id: 1, campus: CAMPUS, unidade: UNIDADE, bloco: { id: 1, nome: 'BLOCO 1' }, andar: 1 },
        capacidade: 30,
        area: 50,
    },
    {
        id: 2,
        nome: 'Sala 102',
        tipo: TipoAmbiente.LABORATORIO,
        localizacao: { id: 2, campus: CAMPUS, unidade: UNIDADE, bloco: { id: 2, nome: 'BLOCO 2' }, andar: 0 },
        capacidade: 20,
        area: 40,
    },
]

function renderWithRouter(props: React.ComponentProps<typeof TabelaPadrao>) {
    return render(
        <MemoryRouter>
            <TabelaPadrao {...props} />
        </MemoryRouter>,
    )
}

beforeEach(() => {
    mockUseIsMobile.mockReturnValue(false)
})

describe('TabelaPadrao — modo público (sem seleção)', () => {
    it('não renderiza coluna de checkbox quando onToggleSelect ausente', () => {
        renderWithRouter({ itens: mockItens })
        expect(screen.queryByLabelText('Selecionar todos da página')).not.toBeInTheDocument()
        expect(screen.queryByLabelText('Selecionar Sala 101')).not.toBeInTheDocument()
    })

    it('renderiza colunas padrão e link para detalhe', () => {
        renderWithRouter({ itens: mockItens })
        expect(screen.getByText('Nome')).toBeInTheDocument()
        expect(screen.getByText('Localização')).toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'Sala 101' })).toHaveAttribute(
            'href',
            '/ambientes/publicados/1',
        )
    })

    it('exibe campus, unidade e bloco na localização', () => {
        renderWithRouter({ itens: mockItens })
        expect(screen.getByText('LIMOEIRO DO NORTE • SEDE • BLOCO 1')).toBeInTheDocument()
        expect(screen.getByText('LIMOEIRO DO NORTE • SEDE • BLOCO 2')).toBeInTheDocument()
    })

    it('renderiza andar térreo', () => {
        renderWithRouter({ itens: mockItens })
        expect(screen.getByText('Térreo')).toBeInTheDocument()
    })
})

describe('TabelaPadrao — modo seleção (autenticado)', () => {
    it('renderiza checkbox no header e em cada linha quando onToggleSelect presente', () => {
        renderWithRouter({
            itens: mockItens,
            selectedIds: [],
            onToggleSelect: vi.fn(),
            onToggleSelectAll: vi.fn(),
            allSelected: false,
            someSelected: false,
        })
        expect(screen.getByLabelText('Selecionar todos da página')).toBeInTheDocument()
        expect(screen.getByLabelText('Selecionar Sala 101')).toBeInTheDocument()
        expect(screen.getByLabelText('Selecionar Sala 102')).toBeInTheDocument()
    })

    it('chama onToggleSelect ao clicar no checkbox de uma linha', () => {
        const onToggleSelect = vi.fn()
        renderWithRouter({
            itens: mockItens,
            selectedIds: [],
            onToggleSelect,
            onToggleSelectAll: vi.fn(),
            allSelected: false,
            someSelected: false,
        })
        fireEvent.click(screen.getByLabelText('Selecionar Sala 101'))
        expect(onToggleSelect).toHaveBeenCalledWith(1)
    })

    it('chama onToggleSelectAll ao clicar no checkbox do header', () => {
        const onToggleSelectAll = vi.fn()
        renderWithRouter({
            itens: mockItens,
            selectedIds: [],
            onToggleSelect: vi.fn(),
            onToggleSelectAll,
            allSelected: false,
            someSelected: false,
        })
        fireEvent.click(screen.getByLabelText('Selecionar todos da página'))
        expect(onToggleSelectAll).toHaveBeenCalled()
    })

    it('marca linha como selecionada quando id está em selectedIds', () => {
        renderWithRouter({
            itens: mockItens,
            selectedIds: [1],
            onToggleSelect: vi.fn(),
            onToggleSelectAll: vi.fn(),
            allSelected: false,
            someSelected: true,
        })
        const linhas = screen.getAllByRole('row')
        // linha 0 = header, linha 1 = Sala 101 (selecionada), linha 2 = Sala 102
        expect(linhas[1]).toHaveAttribute('data-selected', 'true')
        expect(linhas[2]).not.toHaveAttribute('data-selected')
    })

    it('mantém link para detalhe mesmo no modo seleção', () => {
        renderWithRouter({
            itens: mockItens,
            selectedIds: [],
            onToggleSelect: vi.fn(),
            onToggleSelectAll: vi.fn(),
            allSelected: false,
            someSelected: false,
        })
        expect(screen.getByRole('link', { name: 'Sala 101' })).toHaveAttribute(
            'href',
            '/ambientes/publicados/1',
        )
    })
})

describe('TabelaPadrao — cards em mobile (<md)', () => {
    beforeEach(() => {
        mockUseIsMobile.mockReturnValue(true)
    })

    it('renderiza cards em vez da tabela', () => {
        renderWithRouter({ itens: mockItens })

        expect(screen.queryByRole('table')).not.toBeInTheDocument()
        expect(screen.getByTestId('tabela-cards')).toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'Sala 101' })).toHaveAttribute(
            'href',
            '/ambientes/publicados/1',
        )
        expect(screen.getByText(TipoAmbiente.SALA_AULA)).toBeInTheDocument()
        expect(screen.getByText('LIMOEIRO DO NORTE • SEDE • BLOCO 1')).toBeInTheDocument()
        expect(screen.getByText('Térreo')).toBeInTheDocument()
        expect(screen.getByText('Capacidade 30 • 50.00 m²')).toBeInTheDocument()
    })

    it('não renderiza checkboxes no modo público, inclusive o selecionar todos', () => {
        renderWithRouter({ itens: mockItens })

        expect(screen.queryByLabelText('Selecionar todos da página')).not.toBeInTheDocument()
        expect(screen.queryByLabelText('Selecionar Sala 101')).not.toBeInTheDocument()
    })

    it('integra o checkbox de seleção ao card e chama onToggleSelect', () => {
        const onToggleSelect = vi.fn()
        renderWithRouter({
            itens: mockItens,
            selectedIds: [1],
            onToggleSelect,
            onToggleSelectAll: vi.fn(),
            allSelected: false,
            someSelected: true,
        })

        fireEvent.click(screen.getByLabelText('Selecionar Sala 101'))
        expect(onToggleSelect).toHaveBeenCalledWith(1)
    })

    it('exibe "Selecionar todos da página" no topo dos cards e chama onToggleSelectAll', () => {
        const onToggleSelectAll = vi.fn()
        renderWithRouter({
            itens: mockItens,
            selectedIds: [],
            onToggleSelect: vi.fn(),
            onToggleSelectAll,
            allSelected: false,
            someSelected: false,
        })

        expect(screen.getByText('Selecionar todos da página')).toBeVisible()
        fireEvent.click(
            screen.getByRole('checkbox', {name: 'Selecionar todos da página'}),
        )
        expect(onToggleSelectAll).toHaveBeenCalledOnce()
    })
})