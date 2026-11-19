import {describe, expect, it} from 'vitest'
import {parseIdPositivo} from './parse-id'

describe('parseIdPositivo', () => {
    it('aceita inteiros positivos', () => {
        expect(parseIdPositivo('1')).toBe(1)
        expect(parseIdPositivo('42')).toBe(42)
    })

    it.each(['0', '-1', '1.5', 'abc', '', undefined])('rejeita %s', (valor) => {
        expect(parseIdPositivo(valor)).toBeNull()
    })
})
