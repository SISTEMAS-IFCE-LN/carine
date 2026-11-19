package br.edu.ifce.ambientes_internos.model.dto.ambiente

import java.math.BigDecimal

data class BlocoResumoRes(
    val id: Long,
    val nome: String,
    val areaTotal: BigDecimal,
    val pavimentos: Int,
    val capacidadeTotal: Int,
    val tipos: List<TipoTotal>,
    val andares: List<AndarTotal>,
) {
    data class TipoTotal(val tipo: String, val total: Int)
    data class AndarTotal(val andar: Int, val total: Int)
}
