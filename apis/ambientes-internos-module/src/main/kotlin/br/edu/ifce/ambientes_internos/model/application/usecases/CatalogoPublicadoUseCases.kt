package br.edu.ifce.ambientes_internos.model.application.usecases

import br.edu.ifce.ambientes_internos.model.application.interfaces.ICatalogoPublicadoUseCases
import br.edu.ifce.ambientes_internos.model.domain.entity.ambientes.enums.StatusAmbiente
import br.edu.ifce.ambientes_internos.model.dto.ambiente.BlocoRes
import br.edu.ifce.ambientes_internos.model.dto.ambiente.BlocoResumoRes
import br.edu.ifce.ambientes_internos.model.dto.ambiente.CampusRes
import br.edu.ifce.ambientes_internos.model.dto.ambiente.UnidadeRes
import br.edu.ifce.ambientes_internos.model.repository.AmbienteRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.math.RoundingMode

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

    @Transactional(readOnly = true)
    override fun obterResumoBloco(blocoId: Long): BlocoResumoRes {
        val publicados = repoAmb.findAllByBlocoAndStatus(blocoId, StatusAmbiente.PUBLICADO)
        if (publicados.isEmpty()) {
            throw NoSuchElementException("Bloco não encontrado ou sem ambientes publicados.")
        }

        val areaTotal = publicados
            .fold(BigDecimal.ZERO) { acc, ambiente -> acc.add(ambiente.calcularAreaAmbienteM2()) }
            .setScale(2, RoundingMode.HALF_UP)

        val tipos = publicados
            .groupBy { requireNotNull(it.tipo).nome }
            .map { (tipo, lista) -> BlocoResumoRes.TipoTotal(tipo, lista.size) }
            .sortedWith { a, b -> ComparadorNatural.comparar(a.tipo, b.tipo) }

        val andares = publicados
            .groupBy { it.localizacao.andar }
            .map { (andar, lista) -> BlocoResumoRes.AndarTotal(andar, lista.size) }
            .sortedBy { it.andar }

        val primeiro = publicados.first()
        return BlocoResumoRes(
            id = requireNotNull(primeiro.localizacao.bloco.id),
            nome = primeiro.localizacao.bloco.nome,
            areaTotal = areaTotal,
            pavimentos = publicados.maxOf { it.localizacao.andar } + 1,
            capacidadeTotal = publicados.sumOf { it.capacidade },
            tipos = tipos,
            andares = andares,
        )
    }
}
