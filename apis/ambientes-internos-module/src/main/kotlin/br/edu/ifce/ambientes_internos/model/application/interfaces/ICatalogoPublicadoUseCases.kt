package br.edu.ifce.ambientes_internos.model.application.interfaces

import br.edu.ifce.ambientes_internos.model.dto.ambiente.BlocoRes
import br.edu.ifce.ambientes_internos.model.dto.ambiente.BlocoResumoRes
import br.edu.ifce.ambientes_internos.model.dto.ambiente.CampusRes
import br.edu.ifce.ambientes_internos.model.dto.ambiente.UnidadeRes

interface ICatalogoPublicadoUseCases {
    fun listarCampusPublicado(): List<CampusRes>
    fun listarUnidadesPublicado(campusId: Long): List<UnidadeRes>
    fun listarBlocosPublicado(unidadeId: Long): List<BlocoRes>
    fun obterResumoBloco(blocoId: Long): BlocoResumoRes
}
