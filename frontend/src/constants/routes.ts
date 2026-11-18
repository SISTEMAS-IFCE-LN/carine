export const PAGES_ROUTES = {
    LOGIN: '/login',
    CALLBACK: '/callback',
    HOME: '/',
    UNAUTHORIZED: '/unauthorized',
    PUBLICADOS: '/ambientes/publicados',
    VALIDACAO: '/ambientes/validacao',
    NAO_PUBLICADOS: '/ambientes/nao-publicados',
    USUARIOS: '/usuarios',
    GOOGLE_OAUTH_ENTRY: '/oauth2/authorization/google',
    CAMPUS: '/campus',
    UNIDADE: '/unidade',
    BLOCO: '/bloco',
} as const

export function rotaCampus(campusId: number): string {
    return `${PAGES_ROUTES.CAMPUS}/${campusId}`
}

export function rotaUnidade(unidadeId: number): string {
    return `${PAGES_ROUTES.UNIDADE}/${unidadeId}`
}

export function rotaBloco(blocoId: number): string {
    return `${PAGES_ROUTES.BLOCO}/${blocoId}`
}

export interface ParametrosListagemPublicados {
    campusId?: number | null
    unidadeId?: number | null
    blocoId?: number | null
    tipo?: string | null
    andar?: number | null
}

/**
 * URL da listagem pública com filtros combinados. Omite `undefined`/`null`/string vazia e retorna
 * `PAGES_ROUTES.PUBLICADOS` sem query quando não há parâmetro. Codificação via `URLSearchParams`
 * (espaço vira `+`; `?tipo=Sala+de+Aula`) — nunca `encodeURIComponent` manual.
 */
export function rotaListagemPublicados(params: ParametrosListagemPublicados = {}): string {
    const search = new URLSearchParams()
    const entradas: Array<[string, number | string | null | undefined]> = [
        ['campusId', params.campusId],
        ['unidadeId', params.unidadeId],
        ['blocoId', params.blocoId],
        ['tipo', params.tipo],
        ['andar', params.andar],
    ]
    for (const [chave, valor] of entradas) {
        if (valor === undefined || valor === null) continue
        if (typeof valor === 'string' && valor.trim() === '') continue
        search.set(chave, String(valor))
    }
    const query = search.toString()
    return query ? `${PAGES_ROUTES.PUBLICADOS}?${query}` : PAGES_ROUTES.PUBLICADOS
}

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? ''

const API_BASE_PATH = '/api'
const API_AMBIENTES_PATH = `${API_BASE_PATH}/ambientes`

export const API_ROUTES = {
    AUTH: '/auth',
    CAMPUS: `${API_BASE_PATH}/campus`,
    UNIDADES: `${API_BASE_PATH}/unidades`,
    BLOCOS: `${API_BASE_PATH}/blocos`,
    PUBLICADOS: `${API_AMBIENTES_PATH}/publicados`,
    PUBLICADO_CAMPUS: `${API_AMBIENTES_PATH}/publicados/campus`,
    PUBLICADO_UNIDADES: `${API_AMBIENTES_PATH}/publicados/unidades`,
    PUBLICADO_BLOCOS: `${API_AMBIENTES_PATH}/publicados/blocos`,
    VALIDACAO: `${API_AMBIENTES_PATH}/validacao`,
    NAO_PUBLICADOS: `${API_AMBIENTES_PATH}/nao-publicados`,
    USUARIOS: `${API_BASE_PATH}/usuarios`
} as const
