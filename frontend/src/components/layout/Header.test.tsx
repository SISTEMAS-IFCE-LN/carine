import {render, screen, fireEvent} from '@testing-library/react'
import {MemoryRouter} from 'react-router'
import {describe, it, expect, vi, beforeEach} from 'vitest'
import {Header} from './Header'
import {Role} from '@/types/usuarios/user'

const mockUseAuth = vi.fn()

vi.mock('@/hooks/useAuth', () => ({
    useAuth: () => mockUseAuth(),
}))

function renderWithAuth() {
    return render(
        <MemoryRouter>
            <Header/>
        </MemoryRouter>,
    )
}

const userAutenticado = {
    id: 1,
    email: 'user@ifce.edu.br',
    nome: 'Usuário Teste',
    ativo: true,
    criadoEm: '',
    perfis: [Role.COLABORADOR],
}

describe('Header — anônimo', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockUseAuth.mockReturnValue({user: null, isAuthenticated: false, isLoading: false, login: vi.fn(), logout: vi.fn(), refreshUser: vi.fn()})
    })

    it('renderiza o logo/título', () => {
        renderWithAuth()
        expect(screen.getByText('CARINE')).toBeInTheDocument()
        expect(screen.getByText('Catálogo de Registro de Informações de Edificações do IFCE'))
            .toBeInTheDocument()
        expect(screen.getByRole('link', {
            name: 'CARINE: Catálogo de Registro de Informações de Edificações do IFCE',
        })).toHaveAttribute('href', '/')
    })

    it('não renderiza HeaderNav', () => {
        renderWithAuth()
        expect(screen.queryByRole('button', { name: /Abrir menu de navegação/i })).not.toBeInTheDocument()
    })

    it('não renderiza nome/email do usuário', () => {
        renderWithAuth()
        expect(screen.queryByText('Usuário Teste')).not.toBeInTheDocument()
        expect(screen.queryByText('user@ifce.edu.br')).not.toBeInTheDocument()
    })

    it('não renderiza botão Sair', () => {
        renderWithAuth()
        expect(screen.queryByText('Sair')).not.toBeInTheDocument()
    })

    it('renderiza botão Login como link para /login', () => {
        renderWithAuth()
        const loginLink = screen.getByText('Login')
        expect(loginLink).toBeInTheDocument()
        expect(loginLink.closest('a')).toHaveAttribute('href', '/login')
        expect(loginLink.closest('a')).toHaveClass('min-h-11', 'md:min-h-0')
    })
})

describe('Header — autenticado', () => {
    const mockLogout = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
        mockUseAuth.mockReturnValue({
            user: userAutenticado,
            isAuthenticated: true,
            isLoading: false,
            login: vi.fn(),
            logout: mockLogout,
            refreshUser: vi.fn(),
        })
    })

    it('renderiza o logo/título', () => {
        renderWithAuth()
        expect(screen.getByText('CARINE')).toBeInTheDocument()
        expect(screen.getByText('Catálogo de Registro de Informações de Edificações do IFCE'))
            .toBeInTheDocument()
        expect(screen.getByRole('link', {
            name: 'CARINE: Catálogo de Registro de Informações de Edificações do IFCE',
        })).toHaveAttribute('href', '/')
    })

    it('renderiza HeaderNav', () => {
        renderWithAuth()
        expect(screen.getByRole('button', { name: /Abrir menu de navegação/i })).toBeInTheDocument()
    })

    it('renderiza o menu de perfil (triggers mobile e desktop)', () => {
        renderWithAuth()
        expect(screen.getAllByRole('button', {name: /Abrir perfil/i})).toHaveLength(2)
    })

    it('não exibe nome/email/Sair inline antes de abrir o menu', () => {
        renderWithAuth()
        expect(screen.queryByText('Usuário Teste')).not.toBeInTheDocument()
        expect(screen.queryByText('user@ifce.edu.br')).not.toBeInTheDocument()
        expect(screen.queryByText('Sair')).not.toBeInTheDocument()
    })

    it('não renderiza botão Login', () => {
        renderWithAuth()
        expect(screen.queryByText('Login')).not.toBeInTheDocument()
    })

    it('chama logout ao abrir o menu desktop e clicar em Sair', async () => {
        renderWithAuth()
        fireEvent.click(screen.getAllByLabelText('Abrir perfil')[1])
        fireEvent.click(await screen.findByRole('menuitem', {name: 'Sair'}))
        expect(mockLogout).toHaveBeenCalledOnce()
    })
})