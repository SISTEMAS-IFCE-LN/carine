import {act, renderHook} from '@testing-library/react'
import {describe, it, expect, vi, beforeEach} from 'vitest'
import {useVoltar} from './useVoltar'

const mockNavigate = vi.fn()
let mockLocation: {key: string} = {key: 'default'}

vi.mock('react-router', () => ({
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
}))

describe('useVoltar', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockLocation = {key: 'default'}
    })

    it('em entrada direta, navega para o fallback', () => {
        const {result} = renderHook(() => useVoltar('/ambientes/publicados'))

        act(() => result.current())

        expect(mockNavigate).toHaveBeenCalledWith('/ambientes/publicados')
    })

    it('com histórico, volta para a página anterior', () => {
        mockLocation = {key: 'abc123'}
        const {result} = renderHook(() => useVoltar('/ambientes/publicados'))

        act(() => result.current())

        expect(mockNavigate).toHaveBeenCalledWith(-1)
    })

    it('não navega para o fallback quando há histórico (preserva filtros da URL anterior)', () => {
        mockLocation = {key: 'abc123'}
        const {result} = renderHook(() => useVoltar('/'))

        act(() => result.current())

        expect(mockNavigate).toHaveBeenCalledTimes(1)
        expect(mockNavigate).toHaveBeenCalledWith(-1)
        expect(mockNavigate).not.toHaveBeenCalledWith('/')
    })
})
