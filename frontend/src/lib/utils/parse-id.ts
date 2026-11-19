/** Converte um parâmetro de rota em ID positivo; ausente/inválido retorna `null`. */
export function parseIdPositivo(valor: string | undefined): number | null {
    const id = Number(valor)
    return Number.isInteger(id) && id > 0 ? id : null
}
