package br.edu.ifce.ambientes_internos.integracao

import br.edu.ifce.ambientes_internos.TestApplication
import br.edu.ifce.ambientes_internos.TestSecurityConfig
import br.edu.ifce.ambientes_internos.model.domain.entity.ambientes.Localizacao
import br.edu.ifce.ambientes_internos.model.domain.entity.ambientes.SalaAula
import br.edu.ifce.ambientes_internos.model.domain.entity.ambientes.Unidade
import br.edu.ifce.ambientes_internos.model.domain.entity.ambientes.enums.StatusAmbiente
import br.edu.ifce.ambientes_internos.model.domain.entity.geometrias.Geometria
import br.edu.ifce.ambientes_internos.model.domain.entity.geometrias.Retangular
import br.edu.ifce.ambientes_internos.model.repository.AmbienteRepository
import br.edu.ifce.ambientes_internos.model.repository.BlocoRepository
import br.edu.ifce.ambientes_internos.model.repository.CampusRepository
import br.edu.ifce.ambientes_internos.model.repository.UnidadeRepository
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.context.annotation.Import
import org.springframework.http.MediaType
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.content
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.math.BigDecimal

/**
 * Usa um banco H2 dedicado porque a projeção lista todos os níveis com ambiente publicado
 * e o contexto dos demais testes é compartilhado entre classes.
 */
@SpringBootTest(
    classes = [TestApplication::class],
    properties = [
        "spring.datasource.url=jdbc:h2:mem:catalogo_publicado_controller;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE"
    ]
)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(TestSecurityConfig::class)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
// sem @WithMockUser de propósito: os endpoints da hierarquia publicada são públicos
@DisplayName("Testes de integração da hierarquia do catálogo publicado")
class CatalogoPublicadoControllerIntegrationTest {

    @Autowired
    lateinit var mockMvc: MockMvc

    @Autowired
    lateinit var repoAmb: AmbienteRepository

    @Autowired
    lateinit var repoCampus: CampusRepository

    @Autowired
    lateinit var repoUnidade: UnidadeRepository

    @Autowired
    lateinit var repoBloco: BlocoRepository

    private var campusComPublicadoId: Long = 0
    private var campusSemPublicadoId: Long = 0
    private var unidadeComPublicadoId: Long = 0
    private var unidadeSemPublicadoId: Long = 0

    @BeforeAll
    fun prepararDados() {
        val limoeiro = criarCampus(repoCampus, "LIMOEIRO DO NORTE")
        val outroCampus = criarCampus(repoCampus, "OUTRO CAMPUS")
        val cidadeAlta = criarUnidade(repoCampus, repoUnidade, "LIMOEIRO DO NORTE", "CIDADE ALTA")
        val outraUnidade = criarUnidade(repoCampus, repoUnidade, "LIMOEIRO DO NORTE", "OUTRA UNIDADE")
        val unidadeExterna = criarUnidade(repoCampus, repoUnidade, "OUTRO CAMPUS", "UNIDADE EXTERNA")

        criarSala(cidadeAlta, "BLOCO 2", StatusAmbiente.PUBLICADO)
        criarSala(cidadeAlta, "BLOCO 10", StatusAmbiente.PUBLICADO)
        criarSala(cidadeAlta, "BLOCO 2A", StatusAmbiente.PUBLICADO)
        criarSala(cidadeAlta, "BLOCO 99", StatusAmbiente.NAO_PUBLICADO)
        criarSala(outraUnidade, "BLOCO SECRETO", StatusAmbiente.NAO_PUBLICADO)
        criarSala(unidadeExterna, "BLOCO EXTERNO", StatusAmbiente.NAO_PUBLICADO)

        campusComPublicadoId = limoeiro.id!!
        campusSemPublicadoId = outroCampus.id!!
        unidadeComPublicadoId = cidadeAlta.id!!
        unidadeSemPublicadoId = outraUnidade.id!!
    }

    private fun criarSala(unidade: Unidade, bloco: String, status: StatusAmbiente): SalaAula {
        val localizacao = Localizacao(
            bloco = criarBloco(repoBloco, unidade, bloco),
            andar = 0,
        )
        val sala = SalaAula(
            nome = "SALA ${unidade.nome} $bloco",
            localizacao = localizacao,
            capacidade = 40,
            geometrias = mutableSetOf(
                Retangular(base = BigDecimal("5.0"), altura = BigDecimal("6.0")) as Geometria
            ),
            pesDireitos = mutableSetOf(BigDecimal("3.0")),
            esquadrias = mutableSetOf(),
        )
        sala.status = status
        return repoAmb.save(sala)
    }

    @Test
    fun `deve listar somente campi com ambiente publicado sem Authorization`() {
        mockMvc.perform(get("/api/ambientes/publicados/campus"))
            .andExpect(status().isOk)
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].id").value(campusComPublicadoId))
            .andExpect(jsonPath("$[0].nome").value("LIMOEIRO DO NORTE"))
            .andExpect(jsonPath("$[0].unidades").doesNotExist())
    }

    @Test
    fun `deve listar somente unidades com ambiente publicado no campus`() {
        mockMvc.perform(get("/api/ambientes/publicados/unidades").param("campusId", campusComPublicadoId.toString()))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].id").value(unidadeComPublicadoId))
            .andExpect(jsonPath("$[0].nome").value("CIDADE ALTA"))
    }

    @Test
    fun `deve retornar lista vazia para campus sem ambiente publicado`() {
        mockMvc.perform(get("/api/ambientes/publicados/unidades").param("campusId", campusSemPublicadoId.toString()))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()").value(0))
    }

    @Test
    fun `deve retornar lista vazia para campus inexistente`() {
        mockMvc.perform(get("/api/ambientes/publicados/unidades").param("campusId", "999999"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()").value(0))
    }

    @Test
    fun `deve listar blocos publicados da unidade em ordem natural`() {
        mockMvc.perform(get("/api/ambientes/publicados/blocos").param("unidadeId", unidadeComPublicadoId.toString()))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()").value(3))
            .andExpect(jsonPath("$[0].nome").value("BLOCO 2"))
            .andExpect(jsonPath("$[1].nome").value("BLOCO 2A"))
            .andExpect(jsonPath("$[2].nome").value("BLOCO 10"))
    }

    @Test
    fun `nao deve vazar blocos publicados de outra unidade`() {
        mockMvc.perform(get("/api/ambientes/publicados/blocos").param("unidadeId", unidadeSemPublicadoId.toString()))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()").value(0))
    }

    @Test
    fun `deve retornar lista vazia para unidade inexistente`() {
        mockMvc.perform(get("/api/ambientes/publicados/blocos").param("unidadeId", "999999"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()").value(0))
    }

    @Test
    fun `deve retornar 400 para campusId invalido`() {
        mockMvc.perform(get("/api/ambientes/publicados/unidades").param("campusId", "0"))
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `deve retornar 400 para unidadeId invalido`() {
        mockMvc.perform(get("/api/ambientes/publicados/blocos").param("unidadeId", "-1"))
            .andExpect(status().isBadRequest)
    }
}
