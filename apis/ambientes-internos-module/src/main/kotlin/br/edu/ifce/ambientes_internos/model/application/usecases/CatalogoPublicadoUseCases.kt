package br.edu.ifce.ambientes_internos.model.application.usecases

import br.edu.ifce.ambientes_internos.model.application.interfaces.ICatalogoPublicadoUseCases
import br.edu.ifce.ambientes_internos.model.domain.entity.ambientes.enums.StatusAmbiente
import br.edu.ifce.ambientes_internos.model.dto.ambiente.BlocoRes
import br.edu.ifce.ambientes_internos.model.dto.ambiente.CampusRes
import br.edu.ifce.ambientes_internos.model.dto.ambiente.UnidadeRes
import br.edu.ifce.ambientes_internos.model.repository.AmbienteRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class CatalogoPublicadoUseCases(
    private val repoAmb: AmbienteRepository,
) : ICatalogoPublicadoUseCases {

    @Transactional(readOnly = true)
    override fun listarCampusPublicado(): List<CampusRes> =
        repoAmb.findCampiDistintosPorStatus(StatusAmbiente.PUBLICADO)
            .sortedWith { a, b -> ComparadorNatural.comparar(a.nome, b.nome) }
            .map(CampusRes::from)

    @Transactional(readOnly = true)
    override fun listarUnidadesPublicado(campusId: Long): List<UnidadeRes> =
        repoAmb.findUnidadesDistintasPorStatus(campusId, StatusAmbiente.PUBLICADO)
            .sortedWith { a, b -> ComparadorNatural.comparar(a.nome, b.nome) }
            .map(UnidadeRes::from)

    @Transactional(readOnly = true)
    override fun listarBlocosPublicado(unidadeId: Long): List<BlocoRes> =
        repoAmb.findBlocosDistintosPorStatus(unidadeId, StatusAmbiente.PUBLICADO)
            .sortedWith { a, b -> ComparadorNatural.comparar(a.nome, b.nome) }
            .map(BlocoRes::from)
}
