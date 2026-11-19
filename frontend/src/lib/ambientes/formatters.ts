export const DECIMAIS_MEDIDA = 2

/** Medida decimal com 2 casas (`m²`, `m`). Saída idêntica ao `toFixed(2)` das telas de detalhe. */
export function formatarMedida(valor: number): string {
    return valor.toFixed(DECIMAIS_MEDIDA)
}

/** Formato canônico do andar: `Térreo` para `0`; `<N>º Andar` para os demais. */
export function formatarAndar(andar: number): string {
    return andar === 0 ? 'Térreo' : `${andar}º Andar`
}

/** Formato compacto para células de tabela: `Térreo` para `0`; `<N>º` para os demais. */
export function formatarAndarCompacto(andar: number): string {
    return andar === 0 ? 'Térreo' : `${andar}º`
}
