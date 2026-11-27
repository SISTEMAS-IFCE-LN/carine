import {fireEvent, render, screen, within} from '@testing-library/react'
import {describe, it, expect, vi, beforeEach} from 'vitest'
import {UserMenu} from './UserMenu'
import {Role} from '@/types/usuarios/user'

const mockUseAuth = vi.fn()

vi.mock('@/hooks/useAuth', () => ({
    useAuth: () => mockUseAuth(),
}))

const usuario = {
    id: 1,
    email: 'user@ifce.edu.br',
    nome: 'Usuário Teste',
    ativo: true,
    criadoEm: '',
    perfis: [Role.COLABORADOR, Role.VALIDADOR],
}

describe('UserMenu', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('não renderiza nada sem usuário autenticado', () => {
        mockUseAuth.mockReturnValue({user: null, logout: vi.fn()})
        const {container} = render(<UserMenu/>)
        expect(container).toBeEmptyDOMElement()
    })

    it('renderiza os triggers mobile e desktop com iniciais do nome', () => {
        mockUseAuth.mockReturnValue({user: usuario, logout: vi.fn()})
        render(<UserMenu/>)

        expect(screen.getAllByLabelText('Abrir perfil')).toHaveLength(2)
        expect(screen.getAllByText('UT')).toHaveLength(2)
    })

    it('abre o Sheet no mobile com nome, email, perfis e Sair', async () => {
        mockUseAuth.mockReturnValue({user: usuario, logout: vi.fn()})
        render(<UserMenu/>)

        fireEvent.click(screen.getAllByLabelText('Abrir perfil')[0])

        const dialog = await screen.findByRole('dialog', {name: 'Usuário Teste'})
        expect(dialog).toBeInTheDocument()
        expect(within(dialog).getByText('user@ifce.edu.br')).toBeInTheDocument()
        expect(within(dialog).getByText('Colaborador')).toBeInTheDocument()
        expect(within(dialog).getByText('Validador')).toBeInTheDocument()
        expect(within(dialog).getByRole('button', {name: 'Sair'})).toBeInTheDocument()
        expect(within(dialog).getByRole('button', {name: 'Fechar'})).toHaveClass('size-11')
    })

    it('chama logout ao clicar em Sair no Sheet mobile', async () => {
        const logout = vi.fn().mockResolvedValue(undefined)
        mockUseAuth.mockReturnValue({user: usuario, logout})
        render(<UserMenu/>)

        fireEvent.click(screen.getAllByLabelText('Abrir perfil')[0])
        fireEvent.click(await screen.findByRole('button', {name: 'Sair'}))

        expect(logout).toHaveBeenCalledOnce()
    })

    it('abre o DropdownMenu no desktop com nome, email e Sair', async () => {
        mockUseAuth.mockReturnValue({user: usuario, logout: vi.fn()})
        render(<UserMenu/>)

        fireEvent.click(screen.getAllByLabelText('Abrir perfil')[1])

        expect(await screen.findByText('user@ifce.edu.br')).toBeInTheDocument()
        expect(screen.getByRole('menuitem', {name: 'Sair'})).toBeInTheDocument()
    })

    it('chama logout ao clicar em Sair no DropdownMenu desktop', async () => {
        const logout = vi.fn().mockResolvedValue(undefined)
        mockUseAuth.mockReturnValue({user: usuario, logout})
        render(<UserMenu/>)

        fireEvent.click(screen.getAllByLabelText('Abrir perfil')[1])
        fireEvent.click(await screen.findByRole('menuitem', {name: 'Sair'}))

        expect(logout).toHaveBeenCalledOnce()
    })
})
