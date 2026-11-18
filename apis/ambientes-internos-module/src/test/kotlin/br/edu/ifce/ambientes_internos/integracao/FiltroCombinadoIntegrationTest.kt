package br.edu.ifce.ambientes_internos.integracao

import br.edu.ifce.ambientes_internos.TestApplication
import br.edu.ifce.ambientes_internos.TestSecurityConfig
import br.edu.ifce.ambientes_internos.model.domain.entity.ambientes.Bloco
import br.edu.ifce.ambientes_internos.model.domain.entity.ambientes.Laboratorio
import br.edu.ifce.ambientes_internos.model.domain.entity.ambientes.LaboratorioInformatica
import br.edu.ifce.ambientes_internos.model.domain.entity.ambientes.Localizacao
import br.edu.ifce.ambientes_internos.model.domain.entity.ambientes.SalaAula
import br.edu.ifce.ambientes_internos.model.domain.entity.ambientes.enums.StatusAmbiente
import br.edu.ifce.ambientes_internos.model.domain.entity.geometrias.Geometria
import br.edu.ifce.ambientes_internos.model.domain.entity.geometrias.Retangular
import br.edu.ifce.ambientes_internos.model.repository.AmbienteRepository
import br.edu.ifce.ambientes_internos.model.repository.BlocoRepository
import br.edu.ifce.ambientes_internos.model.repository.CampusRepository
import br.edu.ifce.ambientes_internos.model.repository.UnidadeRepository
import jakarta.servlet.ServletException
import jakarta.validation.ConstraintViolationException
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.context.annotation.Import
import org.springframework.http.HttpHeaders
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.ResultActions
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.math.BigDecimal
import java.util.UUID
import kotlin.test.assertTrue

@SpringBootTest(classes = [TestApplication::class])
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(TestSecurityConfig::class)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@DisplayName("Testes de integração do filtro combinado de localização e tipo")
class FiltroCombinadoIntegrationTest {

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

    private var blocoPublicadoId: Long = 0
    private var blocoValidacaoId: Long = 0
    private var blocoNaoPublicadoId: Long = 0

    @BeforeAll
    fun prepararDados() {
        val sufixo = UUID.randomUUID().toString().take(8).uppercase()
        val unidade = criarUnidade(repoCampus, repoUnidade)

        val blocoPublicado = criarBloco(repoBloco, unidade, "BLOCO COMB PUB $sufixo")
        val blocoValidacao = criarBloco(repoBloco, unidade, "BLOCO COMB VAL $sufixo")
        val blocoNaoPublicado = criarBloco(repoBloco, unidade, "BLOCO COMB NAO $sufixo")

        blocoPublicadoId = blocoPublicado.id!!
        blocoValidacaoId = blocoValidacao.id!!
        blocoNaoPublicadoId = blocoNaoPublicado.id!!

        criarPublicados(blocoPublicado)
        criarEmValidacao(blocoValidacao)
        criarNaoPublicados(blocoNaoPublicado)
    }

    private fun criarPublicados(bloco: Bloco) {
        criarSala(Localizacao(bloco = bloco, andar = 0), StatusAmbiente.PUBLICADO)
        criarLaboratorio(Localizacao(bloco = bloco, andar = 1), StatusAmbiente.PUBLICADO)
        criarLaboratorioInformatica(Localizacao(bloco = bloco, andar = 2), StatusAmbiente.PUBLICADO)
    }

    private fun criarEmValidacao(bloco: Bloco) {
        criarSala(Localizacao(bloco = bloco, andar = 0), StatusAmbiente.AGUARDANDO_VALIDACAO)
        criarLaboratorio(Localizacao(bloco = bloco, andar = 1), StatusAmbiente.AGUARDANDO_VALIDACAO)
    }

    private fun criarNaoPublicados(bloco: Bloco) {
        criarSala(Localizacao(bloco = bloco, andar = 0), StatusAmbiente.NAO_PUBLICADO)
        criarLaboratorio(Localizacao(bloco = bloco, andar = 1), StatusAmbiente.NAO_PUBLICADO)
    }

    private fun criarSala(localizacao: Localizacao, status: StatusAmbiente) {
        val sala = SalaAula(
            nome = "SALA ${UUID.randomUUID().toString().take(8)}",
            localizacao = localizacao,
            capacidade = 30,
            geometrias = geometrias(),
            pesDireitos = mutableSetOf(BigDecimal("3.0")),
            esquadrias = mutableSetOf(),
        )
        sala.status = status
        repoAmb.save(sala)
    }

    private fun criarLaboratorio(localizacao: Localizacao, status: StatusAmbiente) {
        val laboratorio = Laboratorio(
            nome = "LAB ${UUID.randomUUID().toString().take(8)}",
            localizacao = localizacao,
            capacidade = 40,
            geometrias = geometrias(),
            pesDireitos = mutableSetOf(BigDecimal("3.0")),
            esquadrias = mutableSetOf(),
        )
        laboratorio.status = status
        repoAmb.save(laboratorio)
    }

    private fun criarLaboratorioInformatica(localizacao: Localizacao, status: StatusAmbiente) {
        val laboratorio = LaboratorioInformatica(
            nome = "LAB INFO ${UUID.randomUUID().toString().take(8)}",
            localizacao = localizacao,
            capacidade = 50,
            geometrias = geometrias(),
            pesDireitos = mutableSetOf(BigDecimal("3.0")),
            esquadrias = mutableSetOf(),
        )
        laboratorio.status = status
        repoAmb.save(laboratorio)
    }

    private fun geometrias(): MutableSet<Geometria> = mutableSetOf(
        Retangular(base = BigDecimal("5.0"), altura = BigDecimal("4.0")) as Geometria
    )

    private fun publicados(tipo: String?): ResultActions {
        val request = get("/api/ambientes/publicados/localizacao")
            .param("blocoId", blocoPublicadoId.toString())
        if (tipo != null) request.param("tipo", tipo)
        return mockMvc.perform(request)
    }

    private fun assertBadRequestOrValidationError(block: () -> Unit) {
        try {
            block()
        } catch (ex: ServletException) {
            assertTrue(ex.rootCause is ConstraintViolationException)
        }
    }

    @Test
    fun `deve filtrar publicados pelo nome tecnico do tipo`() {
        publicados("LABORATORIO")
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.dadosPaginacao.totalElements").value(1))
            .andExpect(jsonPath("$.ambientes[0].tipo").value("Laboratório"))
    }

    @Test
    fun `deve filtrar publicados pelo rotulo do tipo`() {
        publicados("Laboratório")
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.dadosPaginacao.totalElements").value(1))
            .andExpect(jsonPath("$.ambientes[0].tipo").value("Laboratório"))
    }

    @Test
    fun `nao deve confundir laboratorio com laboratorio de informatica`() {
        publicados("LABORATORIO")
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.ambientes.length()").value(1))
            .andExpect(jsonPath("$.ambientes[0].tipo").value("Laboratório"))

        publicados("LABORATORIO_INFORMATICA")
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.ambientes.length()").value(1))
            .andExpect(jsonPath("$.ambientes[0].tipo").value("Laboratório de Informática"))
    }

    @Test
    fun `deve aceitar o rotulo de laboratorio de informatica`() {
        publicados("Laboratório de Informática")
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.ambientes.length()").value(1))
            .andExpect(jsonPath("$.ambientes[0].tipo").value("Laboratório de Informática"))
    }

    @Test
    fun `deve retornar pagina vazia para tipo sem correspondencia exata`() {
        publicados("lab")
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.ambientes.length()").value(0))

        publicados("LABORATORIO_INFO")
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.ambientes.length()").value(0))
    }

    @Test
    fun `deve manter o comportamento sem tipo`() {
        publicados(null)
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.dadosPaginacao.totalElements").value(3))
    }

    @Test
    fun `deve retornar 400 quando tipo vier sem localizacao`() {
        mockMvc.perform(
            get("/api/ambientes/publicados/localizacao")
                .param("tipo", "SALA_AULA")
        ).andExpect(status().isBadRequest)
    }

    @Test
    fun `deve retornar 400 quando o tipo tiver mais de 50 caracteres`() {
        assertBadRequestOrValidationError {
            mockMvc.perform(
                get("/api/ambientes/publicados/localizacao")
                    .param("blocoId", blocoPublicadoId.toString())
                    .param("tipo", "A".repeat(51))
            ).andExpect(status().isBadRequest)
        }
    }

    @Test
    fun `deve combinar localizacao e tipo na validacao`() {
        mockMvc.perform(
            get("/api/ambientes/validacao/localizacao")
                .param("blocoId", blocoValidacaoId.toString())
                .param("tipo", "LABORATORIO")
                .with(jwtComRoles("ROLE_VALIDADOR"))
                .header(HttpHeaders.ACCEPT, "application/json")
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.dadosPaginacao.totalElements").value(1))
            .andExpect(jsonPath("$.ambientes[0].tipo").value("Laboratório"))
    }

    @Test
    fun `deve combinar localizacao e tipo nos nao publicados`() {
        mockMvc.perform(
            get("/api/ambientes/nao-publicados/localizacao")
                .param("blocoId", blocoNaoPublicadoId.toString())
                .param("tipo", "LABORATORIO")
                .with(jwtComRoles("ROLE_GESTOR_SISTEMA"))
                .header(HttpHeaders.ACCEPT, "application/json")
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.dadosPaginacao.totalElements").value(1))
            .andExpect(jsonPath("$.ambientes[0].tipo").value("Laboratório"))
    }

    private fun jwtComRoles(vararg roles: String) = jwt()
        .jwt { jwt ->
            jwt.claim("roles", roles.toList())
            jwt.subject("teste")
        }
        .authorities(*roles.map { SimpleGrantedAuthority(it) }.toTypedArray())
}
