import {useNavigate, useParams} from 'react-router'
import {useQuery, useQueryClient} from '@tanstack/react-query'
import {FormAmbiente} from '@/components/ambientes/FormAmbiente'
import {LayoutFormularioAmbiente} from '@/components/ambientes/LayoutFormularioAmbiente'
import {Button} from '@/components/ui/button'
import {useAsyncAction} from '@/hooks/useAsyncAction'
import {alterarTipo, fetchAmbienteNaoPublicado} from '@/lib/api/api-naopublicados'
import {ambienteDeDetalhe} from '@/lib/ambientes/mappers'
import {invalidarReferenciasPublicadas} from '@/hooks/useReferenciasPublicadas'
import type {AmbienteInput} from '@/types/ambientes/request'
import {PAGES_ROUTES} from '@/constants/routes'
import {toast} from 'sonner'

/**
 * UC16-FE — página dedicada de alteração de tipo, com o mesmo layout do
 * cadastro (UC06-FE). O POST /{id} recebe um `AmbienteReq` COMPLETO: o wizard
 * é pré-preenchido com todos os dados atuais e o usuário altera o que precisar.
 * Alterar o tipo CRIA um novo ambiente e REMOVE o antigo.
 */
export function AlterarTipoAmbientePage() {
    const {id} = useParams<{ id: string }>()
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const idNumero = Number(id)
    const idValido = Number.isInteger(idNumero) && idNumero > 0

    const {data: ambiente, isLoading, error} = useQuery({
        queryKey: ['ambientes', 'nao-publicados', 'detalhe', id],
        queryFn: ({signal}) => {
            if (!idValido) {
                throw new Error(`ID de ambiente inválido: ${id}`)
            }
            return fetchAmbienteNaoPublicado(idNumero, signal)
        },
        enabled: idValido,
    })

    const {executar} = useAsyncAction({
        onClose: () => undefined, // não há modal; a navegação ocorre no sucesso
        mensagemPadrao: 'Erro ao alterar tipo.',
    })

    async function onSubmit(values: AmbienteInput) {
        if (!ambiente) return
        await executar(async () => {
            const novo = await alterarTipo(ambiente.id, values)
            // O ambiente antigo deixa de existir → invalida a LISTA e as referências
            // (find-or-create pode criar campus/unidade/bloco).
            void queryClient.invalidateQueries({queryKey: ['ambientes', 'nao-publicados']})
            void queryClient.invalidateQueries({queryKey: ['referencias']})
            invalidarReferenciasPublicadas(queryClient)
            toast.success('Tipo alterado.')
            // `replace`: a página de alteração não deve ser o destino do "Voltar"
            // do novo detalhe; o histórico volta para a listagem de origem.
            navigate(`/ambientes/nao-publicados/${novo.id}`, {replace: true})
        })
    }

    function cancelar() {
        if (!ambiente) {
            navigate(PAGES_ROUTES.NAO_PUBLICADOS)
            return
        }
        // `replace`: o ambiente antigo deixa de existir apenas no sucesso; no
        // cancelamento, o detalhe original é restaurado sem duplicar histórico.
        navigate(`/ambientes/nao-publicados/${ambiente.id}`, {replace: true})
    }

    if (isLoading) return <p>Carregando…</p>

    if (error || !ambiente) {
        return (
            <div className="space-y-4">
                <p>Ambiente não encontrado.</p>
                <Button variant="outline" onClick={() => navigate(PAGES_ROUTES.NAO_PUBLICADOS)}>
                    Voltar à lista
                </Button>
            </div>
        )
    }

    return (
        <LayoutFormularioAmbiente
            titulo="Alterar Tipo"
            descricao="Atenção: alterar o tipo cria um novo ambiente e remove o antigo."
            acao={
                <Button
                    variant="outline"
                    onClick={cancelar}
                    className="min-h-11 md:min-h-0"
                >
                    Cancelar
                </Button>
            }
        >
            <FormAmbiente initial={ambienteDeDetalhe(ambiente)} onSubmit={onSubmit}/>
        </LayoutFormularioAmbiente>
    )
}
