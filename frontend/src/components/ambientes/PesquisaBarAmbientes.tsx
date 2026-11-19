import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useMemo, useState } from 'react'
import { type Filtros, FILTROS_VAZIOS, derivarTipoFiltro, temLocalizacao } from '@/types/ambientes/filtros'
import { chaveTipoAmbiente, TipoAmbiente, TipoFiltro } from '@/types/ambientes/enums'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useFiltroLocal } from '@/hooks/useFiltroLocal'
import { CampoReferencia } from '@/components/ambientes/CampoReferencia'
import { useCampus, useUnidades, useBlocos } from '@/hooks/useReferencias'
import {
  useBlocosPublicados,
  useCampusPublicados,
  useUnidadesPublicados,
} from '@/hooks/useReferenciasPublicadas'

// Converte o nome do enum (ex.: "SALA_AULA") no rótulo exibido (ex.: "Sala de Aula")
function rotuloTipo(tipo: string): string {
  return TipoAmbiente[tipo as keyof typeof TipoAmbiente] ?? tipo
}

// Opções do seletor de modo de filtro: fonte única para o trigger e o menu.
const OPCOES_TIPO_FILTRO: ReadonlyArray<{valor: TipoFiltro; rotulo: string}> = [
  {valor: TipoFiltro.NENHUM, rotulo: 'Nenhum'},
  {valor: TipoFiltro.NOME, rotulo: 'Nome'},
  {valor: TipoFiltro.TIPO, rotulo: 'Tipo'},
  {valor: TipoFiltro.LOCALIZACAO, rotulo: 'Localização'},
  {valor: TipoFiltro.LOCALIZACAO_TIPO, rotulo: 'Localização + Tipo'},
]

function rotuloTipoFiltro(tipo: string): string {
  return OPCOES_TIPO_FILTRO.find((opcao) => opcao.valor === tipo)?.rotulo ?? tipo
}

export interface PesquisaBarAmbientesProps {
  initial: Filtros
  onChange: (f: Filtros) => void
  /** Página pública usa a projeção publicada; gestão/validação usam as refs completas. */
  fonte: 'publicados' | 'gerais'
}

export function PesquisaBarAmbientes({ initial, onChange, fonte }: PesquisaBarAmbientesProps) {
  const initialNormalizado = useMemo<Filtros>(
    () => ({ ...initial, tipo: chaveTipoAmbiente(initial.tipo) }),
    [initial],
  )

  const [tipoFiltro, setTipoFiltro] = useState<TipoFiltro>(() => derivarTipoFiltro(initialNormalizado))

  const { local, setLocal } = useFiltroLocal<Filtros>(initialNormalizado, () => {
    // Re-derivar tipo de filtro quando initial muda externamente (back/forward)
    setTipoFiltro(derivarTipoFiltro(initialNormalizado))
  })

  const usandoPublicadas = fonte === 'publicados'

  const campiPub = useCampusPublicados({ enabled: usandoPublicadas })
  const campiGerais = useCampus({ enabled: !usandoPublicadas })
  const unidadesPub = useUnidadesPublicados(
    usandoPublicadas ? local.campusId : null,
    { enabled: usandoPublicadas },
  )
  const unidadesGerais = useUnidades(
    !usandoPublicadas ? local.campusId : null,
    { enabled: !usandoPublicadas },
  )
  const blocosPub = useBlocosPublicados(
    usandoPublicadas ? local.unidadeId : null,
    { enabled: usandoPublicadas },
  )
  const blocosGerais = useBlocos(
    !usandoPublicadas ? local.unidadeId : null,
    { enabled: !usandoPublicadas },
  )

  const campi = usandoPublicadas ? (campiPub.data ?? []) : (campiGerais.data ?? [])
  const unidades = usandoPublicadas ? (unidadesPub.data ?? []) : (unidadesGerais.data ?? [])
  const blocos = usandoPublicadas ? (blocosPub.data ?? []) : (blocosGerais.data ?? [])
  const carregandoCampi = usandoPublicadas ? campiPub.isLoading : campiGerais.isLoading
  const carregandoUnidades = usandoPublicadas ? unidadesPub.isLoading : unidadesGerais.isLoading
  const carregandoBlocos = usandoPublicadas ? blocosPub.isLoading : blocosGerais.isLoading

  function handleTipoFiltroChange(value: string | null) {
    setTipoFiltro((value ?? '') as TipoFiltro)
    // Limpar filtros ao trocar de tipo
    setLocal(FILTROS_VAZIOS)
  }

  function handleAndarChange(value: string) {
    const numValue = value === '' ? null : Number(value)
    if (numValue !== null && numValue < 0) return // Validação frontend
    setLocal({ ...local, andar: numValue })
  }

  function handleLimpar() {
    setLocal(FILTROS_VAZIOS)
    setTipoFiltro(TipoFiltro.NENHUM)
    onChange(FILTROS_VAZIOS)
  }

  function handleAplicar() {
    // Validar antes de aplicar
    if (tipoFiltro === TipoFiltro.NOME && !local.nome.trim()) return
    if (tipoFiltro === TipoFiltro.TIPO && !local.tipo) return
    if (tipoFiltro === TipoFiltro.LOCALIZACAO_TIPO && (!local.tipo || !temLocalizacao(local))) return
    onChange(local)
  }

  const temFiltros =
    initial.nome !== '' ||
    initial.campusId !== null ||
    initial.unidadeId !== null ||
    initial.blocoId !== null ||
    initial.andar !== null ||
    initial.tipo !== ''

  const camposLocalizacao = (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
      <CampoReferencia
        label="Campus"
        value={{ id: local.campusId, nome: null }}
        opcoes={campi}
        carregando={carregandoCampi}
        permitirCadastro={false}
        onChange={(v) => setLocal({
          ...local,
          campusId: v.id,
          unidadeId: null,
          blocoId: null,
        })}
      />

      <CampoReferencia
        label="Unidade"
        value={{ id: local.unidadeId, nome: null }}
        opcoes={unidades}
        carregando={carregandoUnidades}
        permitirCadastro={false}
        disabled={local.campusId === null}
        onChange={(v) => setLocal({
          ...local,
          unidadeId: v.id,
          blocoId: null,
        })}
      />

      <CampoReferencia
        label="Bloco"
        value={{ id: local.blocoId, nome: null }}
        opcoes={blocos}
        carregando={carregandoBlocos}
        permitirCadastro={false}
        disabled={local.unidadeId === null}
        onChange={(v) => setLocal({ ...local, blocoId: v.id })}
      />

      <div className="space-y-1.5">
        <Label htmlFor="filtro-andar">Andar</Label>
        <Input
          id="filtro-andar"
          type="number"
          placeholder="Ex.: 0"
          value={local.andar ?? ''}
          onChange={(e) => handleAndarChange(e.target.value)}
          min={0}
        />
      </div>
    </div>
  )

  const campoTipo = (
    <div className="max-w-md space-y-1.5">
      <Label htmlFor="filtro-tipo-barra">Tipo</Label>
      <Select
        value={local.tipo}
        onValueChange={(value) => setLocal({ ...local, tipo: value ?? '' })}
      >
        <SelectTrigger id="filtro-tipo-barra">
          <SelectValue placeholder="Selecione o tipo">
            {local.tipo ? rotuloTipo(local.tipo) : undefined}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {Object.entries(TipoAmbiente).map(([key, value]) => (
            <SelectItem key={key} value={key}>
              {value}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Seletor de Tipo de Filtro */}
      <div className="max-w-xs">
        <Select value={tipoFiltro} onValueChange={handleTipoFiltroChange}>
          <SelectTrigger aria-label="Tipo de filtro">
            {tipoFiltro ? (
              <span>{rotuloTipoFiltro(tipoFiltro)}</span>
            ) : (
              <SelectValue placeholder="Selecione o tipo de filtro" />
            )}
          </SelectTrigger>
          <SelectContent>
            {OPCOES_TIPO_FILTRO.map((opcao) => (
              <SelectItem key={opcao.valor} value={opcao.valor}>
                {opcao.rotulo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Inputs Dinâmicos */}
      {tipoFiltro === TipoFiltro.NOME && (
        <div className="max-w-md">
          <Input
            placeholder="Nome do ambiente"
            aria-label="Filtrar por nome"
            value={local.nome}
            onChange={(e) => setLocal({ ...local, nome: e.target.value })}
            maxLength={50}
          />
        </div>
      )}

      {tipoFiltro === TipoFiltro.TIPO && campoTipo}

      {tipoFiltro === TipoFiltro.LOCALIZACAO && camposLocalizacao}

      {tipoFiltro === TipoFiltro.LOCALIZACAO_TIPO && (
        <div className="space-y-3">
          {camposLocalizacao}
          {campoTipo}
        </div>
      )}

      {/* Botões */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={handleAplicar}
          disabled={tipoFiltro === TipoFiltro.NENHUM}
          className="min-h-11 md:min-h-0"
        >
          Aplicar
        </Button>
        {temFiltros && (
          <Button variant="ghost" onClick={handleLimpar} className="min-h-11 md:min-h-0">
            Limpar
          </Button>
        )}
      </div>
    </div>
  )
}
