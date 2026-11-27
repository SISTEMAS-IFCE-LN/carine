import {useLocation, useNavigate} from 'react-router'

/**
 * Comportamento padrão do botão "Voltar" (casos-uso-frontend.md UC21-FE):
 * usa o histórico anterior quando existe; em entrada direta
 * (`location.key === 'default'`), navega para a lista de origem (`fallback`).
 *
 * Assim, listas filtradas/paginadas são preservadas ao voltar de uma tela de
 * detalhe — em vez de cair sempre na rota sem query string.
 */
export function useVoltar(fallback: string): () => void {
    const navigate = useNavigate()
    const location = useLocation()

    return () => {
        if (location.key !== 'default') {
            navigate(-1)
        } else {
            navigate(fallback)
        }
    }
}
